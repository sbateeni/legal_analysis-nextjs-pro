import argparse
import hashlib
import json
import os
import pathlib
import re
import time
from urllib.parse import urljoin, urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except Exception:
    pdf_extract_text = None

# Optional OCR deps
try:
    import pytesseract  # type: ignore
    from pdf2image import convert_from_bytes  # type: ignore
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

UA = "LegalCrawler/1.0 (+contact: admin@example.com)"
DEFAULT_RATE = 1.0


def sanitize_filename(name):
    """تنظيف اسم الملف من الأحرف غير المسموحة مع الحفاظ على النص العربي"""
    # الحفاظ على الأحرف العربية والأرقام والمسافات والنقاط
    name = re.sub(r'[\\/*?:"<>|]', "_", name)
    name = re.sub(r"\s+", " ", name)
    name = name.strip()
    
    # تقليل طول الاسم إذا كان طويلاً جداً مع الحفاظ على النهايات المهمة
    if len(name) > 150:
        # محاولة الحفاظ على الجزء الأخير من الاسم الذي قد يحتوي على رقم القانون أو السنة
        parts = name.split()
        if len(parts) > 5:
            # أخذ أول 3 كلمات وآخر 3 كلمات
            name = " ".join(parts[:3] + ["..."] + parts[-3:])
        else:
            name = name[:150] + "..."
    return name


def wrap_rtl_for_filename(title: str) -> str:
    """لف عنوان عربي بعلامات اتجاه لضمان عرض صحيح في أنظمة الملفات.

    نستخدم RLE/RLM لتثبيت اتجاه النص العربي، مع LRM قبل الجزء اللاتيني.
    """
    # إذا احتوى على أحرف عربية نغلفه بعلامة تضمين RTL ونغلقها
    if any('\u0600' <= ch <= '\u06FF' for ch in title):
        # U+202B: Right-to-Left Embedding, U+202C: Pop Directional Formatting
        return "\u202B" + title + "\u202C"
    return title


def extract_title_from_content(text, url):
    """استخراج عنوان من محتوى النص مع دعم النص العربي"""
    # البحث عن أنماط شائعة للعناوين في القوانين العربية
    patterns = [
        r"قانون\s+(?:رقم\s+)?(\d+\.?\d*)\s+لسنة\s+(\d+)",
        r"مرسوم\s+(?:رقم\s+)?(\d+\.?\d*)\s+لسنة\s+(\d+)",
        r"قرار\s+(?:رقم\s+)?(\d+\.?\d*)\s+لسنة\s+(\d+)",
        r"نظام\s+(?:رقم\s+)?(\d+\.?\d*)\s+لسنة\s+(\d+)",
        r"قانون\s+([^\.]+?)\s+رقم",
        r"بشأن\s+([^\.]+)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if len(match.groups()) > 1:
                return f"قانون {match.group(1)} لسنة {match.group(2)}"
            elif match.group(1):
                return f"قانون {match.group(1)}"
    
    # إذا لم نجد نمطاً محدداً، نبحث عن أول سطر طويل بالعربية
    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        # التحقق من وجود نص عربي (باستخدام نطاق الأحرف العربية في Unicode)
        if any('\u0600' <= char <= '\u06FF' for char in line) and len(line) > 20 and len(line) < 150:
            return line
    
    # كملاذ أخير، نستخدم جزءاً من الرابط
    base_name = urlparse(url).path.split("/")[-1]
    if base_name:
        base_name = base_name.replace(".pdf", "").replace(".html", "").replace(".php", "")
        if base_name and base_name != "/":
            return base_name
    
    return "وثيقة قانونية"


def ensure_rtl_text(text):
    """ضمان معالجة النص العربي بشكل صحيح (يمين لليسار)"""
    # إضافة علامة RLM (Right-to-Left Mark) لتحسين عرض النص العربي
    if any('\u0600' <= char <= '\u06FF' for char in text):
        # إضافة علامة اتجاه النص للغة العربية
        return text
    return text


def collapse_spaces(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def contains_common_ar_terms(text: str) -> bool:
    common = [
        "قانون", "قرار", "رقم", "لسنة", "مرسوم", "نظام", "بشأن", "تشريع",
    ]
    return any(term in text for term in common)


def reverse_if_improves_arabic(token: str) -> str:
    has_ar = any('\u0600' <= ch <= '\u06FF' for ch in token)
    if not has_ar and not any(ch in token for ch in ")([]){}0123456789"):
        return token
    rev = token[::-1]
    orig_ok = contains_common_ar_terms(token)
    rev_ok = contains_common_ar_terms(rev)
    if rev_ok and not orig_ok:
        return rev
    if token and (token.startswith(')') or token.startswith(']')) and (token.endswith('(') or token.endswith('[')):
        return rev
    return token


def fix_arabic_mirroring(text: str) -> str:
    parts = re.split(r"(\s+)", text)
    fixed_parts: list[str] = []
    for part in parts:
        if part.strip() == "":
            fixed_parts.append(part)
            continue
        fixed_parts.append(reverse_if_improves_arabic(part))
    candidate = "".join(fixed_parts)
    if contains_common_ar_terms(candidate) and not contains_common_ar_terms(text):
        return candidate
    return text


def normalize_legal_terms_ar(text: str) -> str:
    out = text
    out = re.sub(r"\)(\d+)\(", r"(\1)", out)
    out = re.sub(r"\bم(\d{4})\s+ةنسل\b", r"لسنة \1", out)
    replacements = {
        "مقر": "رقم",
        "نوناقب": "بقانون",
        "رارق": "قرار",
        "ةنس": "سنة",
    }
    for wrong, right in replacements.items():
        out = re.sub(fr"(?<!\w){re.escape(wrong)}(?!\w)", right, out)
    return collapse_spaces(out)


def extract_year_from_text(text: str):
    for m in re.findall(r"\b(\d{4})\b", text):
        try:
            year_int = int(m)
            if 1900 <= year_int <= 2099:
                return m
        except Exception:
            pass
    m = re.search(r"\bم(\d{4})\s+ةنسل\b", text)
    if m:
        return m.group(1)
    return None


def canonicalize_legal_title_ar(text: str, original_hint: str | None = None) -> str:
    base = text
    m_num = re.search(r"\((\d+)\)", base)
    m_year = re.search(r"\b(\d{4})\b", base)
    has_qrar = "قرار" in base
    has_biqanun = "بقانون" in base
    has_raqm = "رقم" in base
    if has_qrar and has_biqanun and has_raqm and (m_num or m_year or original_hint):
        num = m_num.group(1) if m_num else None
        year = m_year.group(1) if m_year else None
        if not year and original_hint:
            year = extract_year_from_text(original_hint)
        parts = ["قرار", "بقانون", "رقم"]
        if num:
            parts.append(f"({num})")
        if year:
            parts.extend(["لسنة", year])
        return collapse_spaces(" ".join(parts))
    return text

def fetch(url: str, timeout: int = 25) -> requests.Response:
    r = requests.get(url, timeout=timeout, headers={"User-Agent": UA})
    r.raise_for_status()
    # محاولة اكتشاف الترميز التلقائي للنص العربي
    if r.encoding == 'ISO-8859-1':
        r.encoding = 'utf-8'
    return r


essential_exts = [".pdf", ".doc", ".docx"]


def extract_links(html: str, base: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    links: list[str] = []
    for a in soup.select("a[href]"):
        href = urljoin(base, a.get("href", "").strip())
        if not href:
            continue
        if any(ext in href.lower() for ext in essential_exts) or \
           any(k in href.lower() for k in ["/law/", "/laws", "/legislation", "/decisions", "/judgment", "/court/"]):
            links.append(href)
    # de-dup preserve order
    seen = set()
    unique = []
    for l in links:
        if l in seen:
            continue
        seen.add(l)
        unique.append(l)
    return unique


def extract_links_site_specific(html: str, base: str) -> list[str]:
    """Best-effort site-specific link extraction to improve recall for known portals.

    Falls back to generic when no special rules match.
    """
    parsed = urlparse(base)
    host = parsed.netloc.lower()
    soup = BeautifulSoup(html, "html.parser")

    candidates: list[str] = []

    def norm(h: str) -> str:
        return urljoin(base, h.strip())

    try:
        if "muqtafi.birzeit.edu" in host:
            # Muqtafi often uses paths like /pg/ and detail pages referencing rules
            for a in soup.select('a[href*="pg/"], a[href*="rule"], a[href*="law"], a[href*="Legislation" i], a[href^="javascript:"]'):
                href = a.get("href", "").strip()
                if not href:
                    continue
                # Transform javascript: postbacks that point to PDFPre.aspx?PDFPath=...
                if href.lower().startswith("javascript:") and "pdfpre.aspx?pdfpath=" in href.lower():
                    # naive pull of the query segment inside the javascript call
                    # e.g., javascript:WebForm_DoPostBackWithOptions(... "PDFPre.aspx?PDFPath=Uploads/legislation/202102.pdf" ...)
                    try:
                        start = href.lower().index("pdfpre.aspx?pdfpath=")
                        query_part = href[start:]
                        # stop at last quote or parenthesis
                        for stop_char in ["'", '"', ")"]:
                            if stop_char in query_part:
                                query_part = query_part.split(stop_char)[0]
                        pre_url = norm(query_part)
                        candidates.append(pre_url)
                        # also add direct pdf URL if possible
                        pr = urlparse(pre_url)
                        q = parse_qs(pr.query)
                        pdf_rel = (q.get("PDFPath") or q.get("pdfpath") or [None])[0]
                        if pdf_rel:
                            candidates.append(norm(pdf_rel))
                        continue
                    except Exception:
                        pass
                candidates.append(norm(href))
        elif host.endswith("moj.pna.ps"):
            # Ministry of Justice portal; look for legislation sections and Arabic anchors
            for a in soup.select("a[href]"):
                text = (a.get_text(" ", strip=True) or "").lower()
                href = a.get("href", "")
                if not href:
                    continue
                href_l = href.lower()
                if any(w in text for w in ["تشريع", "قانون", "لوائح", "أنظمة"]) or \
                   any(k in href_l for k in ["/legislation", "/laws", "law", "legis"]):
                    candidates.append(norm(href))
    except Exception:
        candidates = []

    # If nothing special found, return generic
    if not candidates:
        return extract_links(html, base)

    # also include generic essentials from the same page to avoid missing PDFs
    generic = extract_links(html, base)
    all_links = candidates + generic
    seen: set[str] = set()
    uniq: list[str] = []
    for link in all_links:
        if link in seen:
            continue
        seen.add(link)
        uniq.append(link)
    return uniq


def sha1(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8", errors="ignore")).hexdigest()


def save_bytes(path: pathlib.Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def save_text(path: pathlib.Path, text: str) -> None:
    """حفظ النص بترميز UTF-8 مع دعم النص العربي"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


def ensure_dir(p: pathlib.Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def pdf_to_text_bytes(data: bytes, enable_ocr: bool = False) -> str:
    # Try text extraction first
    text = ""
    if pdf_extract_text is not None:
        try:
            # write temp
            tmp = pathlib.Path(".tmp_pdf")
            tmp.write_bytes(data)
            text = pdf_extract_text(str(tmp)) or ""
            try:
                tmp.unlink()
            except Exception:
                pass
        except Exception as e:
            print(f"[pdf-extract-error] {e}")
    
    # إذا كان النص قصيراً أو لا يحتوي على عربي، جرب OCR
    if (len(text.strip()) < 100 or not any('\u0600' <= char <= '\u06FF' for char in text)) and enable_ocr and OCR_AVAILABLE:
        try:
            images = convert_from_bytes(data)
            out = []
            for img in images[:5]:  # limit pages for speed
                # استخدام اللغة العربية في OCR
                arabic_text = pytesseract.image_to_string(img, lang='ara')
                out.append(arabic_text)
            ocr_text = "\n".join(out)
            if len(ocr_text.strip()) > 50:
                text = ocr_text
        except Exception as e:
            print(f"[ocr-error] {e}")
    
    return ensure_rtl_text(text)


def save_record(out_jsonl: pathlib.Path, rec: dict) -> None:
    out_jsonl.parent.mkdir(parents=True, exist_ok=True)
    with out_jsonl.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def crawl(seed_url: str, out_dir: pathlib.Path, max_pages: int, rate: float, enable_ocr: bool) -> None:
    files_dir = out_dir / "files"
    text_dir = out_dir / "texts"
    ensure_dir(files_dir)
    ensure_dir(text_dir)
    out_jsonl = out_dir / "corpus.jsonl"

    try:
        resp = fetch(seed_url)
    except Exception as e:
        print("[seed-error]", seed_url, e)
        return

    links = extract_links_site_specific(resp.text, seed_url)[:max_pages]
    for link in links:
        time.sleep(rate)
        try:
            # Skip non-http(s)
            scheme = urlparse(link).scheme.lower()
            if scheme not in ("http", "https"):
                # Special case: constructed PDFPre.aspx candidate without scheme -> normalize
                link = urljoin(seed_url, link)
                scheme = urlparse(link).scheme.lower()
                if scheme not in ("http", "https"):
                    print("[skip-non-http]", link)
                    continue

            # Handle Muqtafi PDFPre.aspx links that embed a PDF path
            lower_link = link.lower()
            if "pdfpre.aspx" in lower_link:
                pr = urlparse(link)
                q = parse_qs(pr.query)
                pdf_rel = (q.get("PDFPath") or q.get("pdfpath") or [None])[0]
                if pdf_rel:
                    direct_pdf = urljoin(link, pdf_rel)
                    link = direct_pdf
                    lower_link = link.lower()

            if lower_link.endswith(".pdf"):
                r = fetch(link)
                
                # استخراج النص من PDF للحصول على عنوان
                text = pdf_to_text_bytes(r.content, enable_ocr=enable_ocr)
                if len(text.strip()) < 100:
                    print("[skip-empty]", link)
                    continue
                
                # استخراج عنوان مناسب ثم تصحيحه وتطبيعه
                raw_title = extract_title_from_content(text, link)
                fixed_title = fix_arabic_mirroring(raw_title)
                fixed_title = normalize_legal_terms_ar(fixed_title)
                final_title = canonicalize_legal_title_ar(fixed_title, original_hint=raw_title)
                title = final_title
                safe_title = sanitize_filename(final_title)
                
                # إنشاء اسم ملف فريد
                fid = sha1(link)
                # Use a neutral ASCII separator to avoid bidi issues in filenames
                filename = f"{safe_title} - {fid[:8]}.pdf"
                fpath = files_dir / filename
                
                # تجنب التكرار
                counter = 1
                while fpath.exists():
                    filename = f"{safe_title} - {fid[:8]}_{counter}.pdf"
                    fpath = files_dir / filename
                    counter += 1
                
                save_bytes(fpath, r.content)
                
                # حفظ النص المستخرج أيضاً في ملف منفصل
                text_filename = f"{safe_title} - {fid[:8]}.txt"
                text_path = text_dir / text_filename
                save_text(text_path, text)
                
                rec = {
                    "id": fid,
                    "type": "law_or_regulation",
                    "title": title,
                    "source_url": link,
                    "issued_at": None,
                    "updated_at": None,
                    "jurisdiction": "PS",
                    "body": text,
                    "version": 1,
                    "filename": filename,
                    "text_file": text_filename,
                }
                save_record(out_jsonl, rec)
                
            else:
                # try html page
                hr = fetch(link)
                soup = BeautifulSoup(hr.text, "html.parser")
                
                # استخراج العنوان من صفحة HTML ثم تصحيحه وتطبيعه
                raw_title = soup.title.text.strip() if soup.title else pathlib.Path(link).name
                if not raw_title or len(raw_title) < 5:
                    raw_title = extract_title_from_content(soup.get_text(), link)
                fixed_title = fix_arabic_mirroring(raw_title)
                fixed_title = normalize_legal_terms_ar(fixed_title)
                final_title = canonicalize_legal_title_ar(fixed_title, original_hint=raw_title)
                title = final_title
                safe_title = sanitize_filename(final_title)
                body = "\n".join([p.get_text(" ", strip=True) for p in soup.select("p, article, .content")])
                
                if len(body) < 100:
                    continue
                
                fid = sha1(link)
                filename = f"{safe_title} - {fid[:8]}.html"
                fpath = files_dir / filename
                
                # تجنب التكرار
                counter = 1
                while fpath.exists():
                    filename = f"{safe_title} - {fid[:8]}_{counter}.html"
                    fpath = files_dir / filename
                    counter += 1
                
                # حفظ محتوى HTML
                save_bytes(fpath, hr.content)
                
                # حفظ النص المستخرج أيضاً في ملف منفصل
                text_filename = f"{safe_title} - {fid[:8]}.txt"
                text_path = text_dir / text_filename
                save_text(text_path, body)
                
                save_record(out_jsonl, {
                    "id": fid,
                    "type": "web_page",
                    "title": title,
                    "source_url": link,
                    "issued_at": None,
                    "updated_at": None,
                    "jurisdiction": "PS",
                    "body": body,
                    "version": 1,
                    "filename": filename,
                    "text_file": text_filename,
                })
                
        except Exception as e:
            print("[error]", link, e)
            continue


def load_seeds(path: pathlib.Path) -> list[str]:
    try:
        j = json.loads(path.read_text(encoding="utf-8"))
        return [s.get("url", "") for s in j.get("sources", []) if s.get("url")]
    except Exception:
        return []


def main() -> None:
    parser = argparse.ArgumentParser(description="Palestinian Legal Corpus Crawler (Standalone)")
    parser.add_argument("--out", default="out", help="Output directory")
    parser.add_argument("--max-pages", type=int, default=50, help="Max pages per seed")
    parser.add_argument("--rate", type=float, default=DEFAULT_RATE, help="Delay between requests in seconds")
    parser.add_argument("--enable-ocr", action="store_true", help="Enable OCR for image-based PDFs")
    parser.add_argument("--seeds", default="seeds.json", help="Seeds JSON file")
    args = parser.parse_args()

    out_dir = pathlib.Path(args.out)
    ensure_dir(out_dir)

    seeds = load_seeds(pathlib.Path(args.seeds))
    if not seeds:
        print("No seeds found. Edit seeds.json and add sources.")
        return

    for seed in seeds:
        print("[seed]", seed)
        crawl(seed, out_dir, args.max_pages, args.rate, args.enable_ocr)


if __name__ == "__main__":
    main()