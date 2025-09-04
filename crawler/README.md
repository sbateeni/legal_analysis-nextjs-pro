# Palestinian Legal Corpus Crawler (Standalone)

هذا مجلد منفصل عن تطبيق الويب، لزحف/تنزيل القوانين واللوائح/الأحكام وتجهيزها لـ RAG.

## المحتويات
- `crawler.py`: سكريبت الزحف والتنزيل والاستخراج إلى JSONL موحّد.
- `seeds.json`: قائمة روابط البدء (مصادر موثوقة). عدّلها قبل التشغيل.
- `requirements.txt`: متطلبات بايثون.
- `.gitignore`: تجاهل مخارج البيانات الثقيلة.

## التحضير
1) بايثون 3.10+
2) أنشئ بيئة افتراضية وثبّت المتطلبات:
```bash
python -m venv .venv
. .venv/bin/activate  # على ويندوز: .venv\Scripts\activate
pip install -r requirements.txt
```
3) عدّل `seeds.json` وأضف روابط البوابات الرسمية/الموثوقة.

اختياري (للـ OCR عند PDFs المصوّرة):
- ثبّت Tesseract OS package + Arabic data (ara), ثم فعّل الخيار `--enable-ocr`.

## التشغيل
```bash
python crawler.py --out ./out --max-pages 100 --enable-ocr
```
خيارات:
- `--out`: مجلد الخرج (افتراضياً `out`).
- `--max-pages`: حد أقصى للصفحات/الروابط لكل بذرة.
- `--enable-ocr`: يفعّل OCR عند فشل الاستخراج النصي من PDF.
- `--rate`: مهلة بين الطلبات بالثواني (افتراضياً 1.0).

## الخرج
- `out/corpus.jsonl`: سجل JSONL موحّد لكل وثيقة: { id, type, title, source_url, issued_at, updated_at, jurisdiction, body, version }.
- `out/files/`: النسخ الأصلية (PDF/DOCX/HTML) للتوثيق.

## ملاحظات قانونية
- احترم `robots.txt` وحدود المعدل للمواقع.
- احفظ المصدر والتاريخ دائماً. يُفضّل مراجعة بشرية قبل الدمج في مستودع الإنتاج.

## دمج لاحقاً مع الموقع
- بعد التحقق من الجودة، انقل `corpus.jsonl` إلى مجلد بيانات داخلي ثم فعّل الاسترجاع (RAG) في طبقة `api/analyze`.
