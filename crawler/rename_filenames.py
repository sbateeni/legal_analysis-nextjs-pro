import argparse
import os
import pathlib
import re
import unicodedata
from typing import Optional, Tuple, Literal


ILLEGAL_FS_CHARS = r"\\/*?:\"<>|"
ILLEGAL_FS_PATTERN = re.compile(rf"[{re.escape(ILLEGAL_FS_CHARS)}]")

# Bidi/formatting chars that can confuse filename display
HIDDEN_BIDI_CHARS = [
    "\u200e",  # LRM
    "\u200f",  # RLM
    "\u202a",  # LRE
    "\u202b",  # RLE
    "\u202c",  # PDF
    "\u202d",  # LRO
    "\u202e",  # RLO
    "\u2066",  # LRI
    "\u2067",  # RLI
    "\u2068",  # FSI
    "\u2069",  # PDI
    "\ufeff",  # BOM/ZWNBSP
]
HIDDEN_BIDI_CLASS = "".join(HIDDEN_BIDI_CHARS)
HIDDEN_BIDI_PATTERN = re.compile(f"[{re.escape(HIDDEN_BIDI_CLASS)}]")


def strip_bidi_controls(text: str) -> str:
    return HIDDEN_BIDI_PATTERN.sub("", text)


def collapse_spaces(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_unicode_arabic(text: str) -> str:
    """Normalize Arabic text by applying NFKC and removing combining marks and tatweel."""
    # Compatibility normalize to convert presentation forms to base letters
    text = unicodedata.normalize("NFKC", text)
    # Remove combining marks
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    # Remove tatweel/kashida
    text = text.replace("\u0640", "")
    return text


def sanitize_title_for_fs(title: str) -> str:
    title = normalize_unicode_arabic(strip_bidi_controls(title))
    title = ILLEGAL_FS_PATTERN.sub(" ", title)
    return collapse_spaces(title)


COMMON_AR_SUBSTRINGS = [
    "قانون", "قرار", "رقم", "لسنة", "مرسوم", "نظام", "بشأن", "قضية", "محكمة", "تشريع",
    "فلسطين", "دولة", "وزارة", "العدل", "الرئيسية", "المحكمة", "القضية",
]


def contains_common_ar_terms(text: str) -> bool:
    return any(term in text for term in COMMON_AR_SUBSTRINGS)


def reverse_if_improves_arabic(token: str) -> str:
    # Only consider reversing if token contains Arabic letters or parentheses/digits
    has_ar = any('\u0600' <= ch <= '\u06FF' for ch in token)
    if not has_ar and not any(ch in token for ch in ")([]){}0123456789"):
        return token
    rev = token[::-1]
    orig_ok = contains_common_ar_terms(token)
    rev_ok = contains_common_ar_terms(rev)
    if rev_ok and not orig_ok:
        return rev
    # Fix mirrored parentheses like )1(
    if token and (token.startswith(')') or token.startswith(']')) and (token.endswith('(') or token.endswith('[')):
        return rev
    return token


def fix_arabic_mirroring(text: str) -> str:
    # Split on spaces but keep tokens; apply reversal heuristic per token
    parts = re.split(r"(\s+)", text)
    fixed_parts: list[str] = []
    for part in parts:
        if part.strip() == "":
            fixed_parts.append(part)
            continue
        fixed_parts.append(reverse_if_improves_arabic(part))
    candidate = "".join(fixed_parts)
    # If fixing produced any of the common terms while original had none, use it
    if contains_common_ar_terms(candidate) and not contains_common_ar_terms(text):
        return candidate
    # Try whole-line reverse if it improves Arabic terms significantly
    whole_rev = text[::-1]
    if contains_common_ar_terms(whole_rev) and not contains_common_ar_terms(text):
        return whole_rev
    return text


def normalize_specific_order_cases(text: str) -> str:
    """حالات ترتيب خاصة، مثل: "م2022 لسنة (97) رقم قرار" -> "قرار رقم (97) لسنة 2022"""
    out = text
    # مYYYY لسنة (N) رقم قرار -> قرار رقم (N) لسنة YYYY
    m = re.search(r"\bم(\d{4})\s+لسنة\s*\((\d+)\)\s+رقم\s+قرار\b", out)
    if m:
        year, num = m.group(1), m.group(2)
        return f"قرار رقم ({num}) لسنة {year}"
    # مYYYY لسنة (N) قرار -> قرار رقم (N) لسنة YYYY
    m = re.search(r"\bم(\d{4})\s+لسنة\s*\((\d+)\)\s+قرار\b", out)
    if m:
        year, num = m.group(1), m.group(2)
        return f"قرار رقم ({num}) لسنة {year}"
    return out


def normalize_legal_terms_ar(text: str) -> str:
    """تطبيع الأنماط الشائعة المعكوسة في عناوين قانونية عربية.

    أمثلة:
    - "م2021 ةنسل" -> "لسنة 2021"
    - ")1(" -> "(1)"
    - "مقر" -> "رقم"
    - "نوناقب" -> "بقانون"
    - "رارق" -> "قرار"
    """
    out = text
    # 1) الأقواس والأرقام المعكوسة
    out = re.sub(r"\)(\d+)\(", r"(\1)", out)
    # 2) سنة بصيغة معكوسة: مYYYY ةنسل
    out = re.sub(r"\bم(\d{4})\s+ةنسل\b", r"لسنة \1", out)
    # 3) كلمات شائعة معكوسة
    replacements = {
        "مقر": "رقم",
        "نوناقب": "بقانون",
        "رارق": "قرار",
        "ةنس": "سنة",  # في حال جاءت منفردة
    }
    # استبدال على حدود الكلمات تقريباً
    for wrong, right in replacements.items():
        out = re.sub(fr"(?<!\w){re.escape(wrong)}(?!\w)", right, out)
    # طي المسافات المكررة
    out = collapse_spaces(out)
    return out


def extract_year_from_text(text: str) -> Optional[str]:
    # Look for a 4-digit year between 1900 and 2099
    for m in re.findall(r"\b(\d{4})\b", text):
        try:
            year_int = int(m)
            if 1900 <= year_int <= 2099:
                return m
        except Exception:
            pass
    # Also catch mirrored form: مYYYY ةنسل
    m = re.search(r"\bم(\d{4})\s+ةنسل\b", text)
    if m:
        return m.group(1)
    return None


def canonicalize_legal_title_ar(text: str, original_hint: Optional[str] = None) -> str:
    """إعادة ترتيب العنوان إلى الصيغة: "قرار بقانون رقم (n) لسنة yyyy" عندما تتوفر المعطيات.

    - يستخرج رقم القرار داخل أقواس إذا وجد
    - يستخرج السنة (4 أرقام)
    - يتحقق من وجود الكلمات الأساسية: قرار، بقانون، رقم
    """
    base = text
    # رقم داخل أقواس
    m_num = re.search(r"\((\d+)\)", base)
    # السنة
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
        candidate = collapse_spaces(" ".join(parts))
        return candidate
    return text


def parse_filename(name: str) -> Optional[Tuple[str, str, Optional[str], Optional[Literal['underscore','paren']], str]]:
    """Return (title, hash8, counter, counter_style, ext) if matches expected patterns.

    Accept common variants:
    - "<title>_<hash8>.ext"
    - "<title> - <hash8>.ext"
    - "<title>_<hash8>_<counter>.ext"
    - "<title> - <hash8>_<counter>.ext"
    - "<title> - <hash8> (<counter>).ext"
    """
    base, ext = os.path.splitext(name)
    if not ext:
        return None
    ext = ext.lstrip(".").lower()
    if ext not in {"pdf", "txt", "html"}:
        return None

    # Strip bidi from base before parsing
    base_clean = strip_bidi_controls(base)

    # Accept optional underscore counter OR parenthesized counter
    m = re.match(
        r"^(?P<title>.*?)[ _-]+(?P<hash>[0-9a-fA-F]{8})(?:_(?P<u_counter>\d+)|\s*\((?P<p_counter>\d+)\))?$",
        base_clean,
    )
    if not m:
        return None
    title = collapse_spaces(m.group("title"))
    hash8 = m.group("hash").lower()
    counter: Optional[str] = None
    counter_style: Optional[Literal['underscore','paren']] = None
    if m.group("u_counter"):
        counter = m.group("u_counter")
        counter_style = 'underscore'
    elif m.group("p_counter"):
        counter = m.group("p_counter")
        counter_style = 'paren'
    return title, hash8, counter, counter_style, ext


def build_new_name(title: str, hash8: str, counter: Optional[str], counter_style: Optional[Literal['underscore','paren']], ext: str) -> str:
    # Attempt to correct mirrored Arabic text and normalize common legal terms
    title_fixed = fix_arabic_mirroring(title)
    title_fixed = normalize_legal_terms_ar(title_fixed)
    title_fixed = normalize_specific_order_cases(title_fixed)
    title_fixed = canonicalize_legal_title_ar(title_fixed, original_hint=title)
    title_fs = sanitize_title_for_fs(title_fixed)
    if counter:
        if counter_style == 'underscore':
            suffix = f"_{counter}"
        else:
            suffix = f" ({counter})"
    else:
        suffix = ""
    return f"{title_fs} - {hash8}{suffix}.{ext}"


def rename_in_directory(directory: pathlib.Path, dry_run: bool = True, skip_on_collision: bool = False) -> tuple[int, int]:
    if not directory.exists() or not directory.is_dir():
        return 0, 0
    applied = 0
    pending = 0
    for entry in directory.iterdir():
        if not entry.is_file():
            continue
        parsed = parse_filename(entry.name)
        if not parsed:
            # Even if not matching, still strip bidi controls
            cleaned = strip_bidi_controls(entry.name)
            if cleaned != entry.name:
                target = directory / cleaned
                if target.exists():
                    if skip_on_collision:
                        print(f"[skip-collision] {entry.name} -> {cleaned}")
                        continue
                print(f"[strip-bidi]{' (dry-run)' if dry_run else ''} {entry.name} -> {cleaned}")
                if not dry_run:
                    entry.rename(target)
                    applied += 1
                else:
                    pending += 1
            continue

        title, hash8, counter, counter_style, ext = parsed
        new_name = build_new_name(title, hash8, counter, counter_style, ext)
        if new_name == entry.name:
            continue

        target = directory / new_name
        # handle collisions by appending numeric suffix
        if target.exists():
            if skip_on_collision:
                print(f"[skip-collision] {entry.name} -> {target.name}")
                continue
            suffix_num = 1
            base, dot, extension = new_name.rpartition(".")
            while True:
                alt_name = f"{base} ({suffix_num}).{extension}"
                alt_path = directory / alt_name
                if not alt_path.exists():
                    target = alt_path
                    break
                suffix_num += 1

        print(f"[rename]{' (dry-run)' if dry_run else ''} {entry.name} -> {target.name}")
        if not dry_run:
            entry.rename(target)
            applied += 1
        else:
            pending += 1
    return applied, pending


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize filenames for Arabic legal corpus output")
    parser.add_argument("--out", default="out", help="Output directory containing 'files' and 'texts'")
    parser.add_argument("--apply", action="store_true", help="Apply changes (otherwise dry-run)")
    parser.add_argument("--skip-on-collision", action="store_true", help="Skip renaming when target already exists")
    args = parser.parse_args()

    root = pathlib.Path(args.out)
    files_dir = root / "files"
    texts_dir = root / "texts"

    applied_total = 0
    pending_total = 0
    a, p = rename_in_directory(files_dir, dry_run=not args.apply, skip_on_collision=args.skip_on_collision)
    applied_total += a
    pending_total += p
    a, p = rename_in_directory(texts_dir, dry_run=not args.apply, skip_on_collision=args.skip_on_collision)
    applied_total += a
    pending_total += p
    if args.apply:
        print(f"Done. Renamed {applied_total} file(s).")
    else:
        print(f"Done. Would rename {pending_total} file(s).")


if __name__ == "__main__":
    main()


