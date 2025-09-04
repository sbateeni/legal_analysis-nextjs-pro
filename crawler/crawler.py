import argparse
import hashlib
import json
import os
import pathlib
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


def fetch(url: str, timeout: int = 25) -> requests.Response:
    r = requests.get(url, timeout=timeout, headers={"User-Agent": UA})
    r.raise_for_status()
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


def ensure_dir(p: pathlib.Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def pdf_to_text_bytes(data: bytes, enable_ocr: bool = False) -> str:
    # Try text extraction first
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
            if len(text.strip()) > 50:
                return text
        except Exception:
            pass
    # Fallback OCR
    if enable_ocr and OCR_AVAILABLE:
        try:
            images = convert_from_bytes(data)
            out = []
            for img in images[:10]:  # limit pages for speed
                out.append(pytesseract.image_to_string(img, lang="ara+eng"))
            text = "\n".join(out)
            return text
        except Exception:
            return ""
    return ""


def save_record(out_jsonl: pathlib.Path, rec: dict) -> None:
    out_jsonl.parent.mkdir(parents=True, exist_ok=True)
    with out_jsonl.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def crawl(seed_url: str, out_dir: pathlib.Path, max_pages: int, rate: float, enable_ocr: bool) -> None:
    files_dir = out_dir / "files"
    ensure_dir(files_dir)
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
                fid = sha1(link)
                fpath = files_dir / f"{fid}.pdf"
                save_bytes(fpath, r.content)
                text = pdf_to_text_bytes(r.content, enable_ocr=enable_ocr)
                if len(text.strip()) < 100:
                    print("[skip-empty]", link)
                    continue
                rec = {
                    "id": fid,
                    "type": "law_or_regulation",
                    "title": pathlib.Path(link).stem,
                    "source_url": link,
                    "issued_at": None,
                    "updated_at": None,
                    "jurisdiction": "PS",
                    "body": text,
                    "version": 1,
                }
                save_record(out_jsonl, rec)
            else:
                # try html page
                hr = fetch(link)
                soup = BeautifulSoup(hr.text, "html.parser")
                title = soup.title.text.strip() if soup.title else pathlib.Path(link).name
                body = "\n".join([p.get_text(" ", strip=True) for p in soup.select("p, article, .content")])
                if len(body) < 100:
                    continue
                fid = sha1(link)
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
