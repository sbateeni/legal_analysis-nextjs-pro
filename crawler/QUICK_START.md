# دليل تشغيل نظام RAG للقانون الفلسطيني 🚀

## 📋 المتطلبات المسبقة

### 1. تثبيت Python 3.8+
```bash
python --version
```

### 2. تثبيت Tesseract OCR (اختياري للـ PDF)
- **Windows**: تحميل من https://github.com/UB-Mannheim/tesseract/wiki
- **Linux**: `sudo apt-get install tesseract-ocr tesseract-ocr-ara`
- **macOS**: `brew install tesseract tesseract-lang`

## 🛠️ التثبيت والإعداد

### 1. تثبيت المتطلبات
```bash
# تثبيت المكتبات الأساسية
pip install -r requirements.txt

# أو تثبيت في بيئة افتراضية
python -m venv venv
source venv/bin/activate  # Linux/macOS
# أو
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 2. تشغيل الزاحف
```bash
# تشغيل الزاحف لجمع القوانين
python crawler.py --seeds seeds.json --out out --max-pages 100 --enable-ocr

# أو بدون OCR
python crawler.py --seeds seeds.json --out out --max-pages 100
```

### 3. اختبار نظام RAG
```bash
# اختبار النظام الأساسي
python rag_system.py
```

### 4. تشغيل API
```bash
# تشغيل خادم API
python legal_api.py --corpus out/corpus.jsonl --port 5001

# أو مع خيارات إضافية
python legal_api.py --corpus out/corpus.jsonl --host 0.0.0.0 --port 5001 --debug
```

## 🔍 استخدام النظام

### 1. البحث في القوانين
```bash
# مثال: البحث عن قوانين الملكية
curl -X POST http://localhost:5001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "قانون الملكية العقارية", "top_k": 5}'
```

### 2. الحصول على السياق القانوني
```bash
# مثال: السياق القانوني للطلاق
curl -X POST http://localhost:5001/api/context \
  -H "Content-Type: application/json" \
  -d '{"query": "الطلاق والخلع", "max_results": 3}'
```

### 3. قائمة الوثائق المتوفرة
```bash
curl http://localhost:5001/api/documents
```

### 4. فحص صحة النظام
```bash
curl http://localhost:5001/health
```

## 🎯 أمثلة الاستخدام

### Python API
```python
import requests

# البحث في القوانين
response = requests.post('http://localhost:5001/api/search', json={
    'query': 'قانون العمل الفلسطيني',
    'top_k': 3
})

results = response.json()
for result in results['results']:
    print(f"العنوان: {result['title']}")
    print(f"التشابه: {result['similarity_score']:.3f}")
    print(f"المقتطف: {result['excerpt'][:100]}...")
    print()
```

### JavaScript/TypeScript
```typescript
// البحث في القوانين
const searchLaws = async (query: string) => {
  const response = await fetch('http://localhost:5001/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: 5 })
  });
  
  return await response.json();
};

// الحصول على السياق القانوني
const getLegalContext = async (query: string) => {
  const response = await fetch('http://localhost:5001/api/context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, max_results: 3 })
  });
  
  return await response.json();
};
```

## 🔧 التخصيص والتطوير

### 1. إضافة مصادر جديدة
```json
// تحديث seeds.json
{
  "sources": [
    {
      "name": "مصدر جديد",
      "url": "https://example.com/legal-docs"
    }
  ]
}
```

### 2. تحسين معالجة النصوص
```python
# في rag_system.py
def _clean_arabic_text(self, text: str) -> str:
    # إضافة قواعد تنظيف مخصصة
    text = re.sub(r'كلمات_مخصصة', 'بديل', text)
    return text
```

### 3. إضافة أنواع وثائق جديدة
```python
# في rag_system.py
DOCUMENT_TYPES = {
    'law': 'قانون',
    'decision': 'حكم قضائي',
    'regulation': 'لائحة',
    'custom_type': 'نوع مخصص'
}
```

## 🚨 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في تحميل النموذج**
   ```bash
   # تأكد من تثبيت sentence-transformers
   pip install sentence-transformers
   ```

2. **خطأ في OCR**
   ```bash
   # تأكد من تثبيت Tesseract
   # أو استخدم --enable-ocr=false
   ```

3. **خطأ في الاتصال بالـ API**
   ```bash
   # تأكد من تشغيل الخادم
   curl http://localhost:5001/health
   ```

4. **ملف المجموعة غير موجود**
   ```bash
   # تأكد من تشغيل الزاحف أولاً
   python crawler.py --seeds seeds.json --out out
   ```

## 📊 مراقبة الأداء

### قياسات مهمة:
- **عدد الوثائق**: `curl http://localhost:5001/api/documents`
- **سرعة البحث**: قياس وقت الاستجابة
- **دقة النتائج**: تقييم جودة الاستشهادات

### تحسين الأداء:
```python
# زيادة حجم الـ chunks للبحث الأسرع
chunk_size = 1024  # بدلاً من 512

# استخدام فهرس FAISS محسن
index = faiss.IndexIVFFlat(quantizer, dimension, nlist)
```

## 🔄 التحديثات المستمرة

### جدولة التحديثات:
```bash
# إضافة إلى cron (Linux/macOS)
0 2 * * * cd /path/to/crawler && python crawler.py --seeds seeds.json --out out

# أو استخدام Task Scheduler (Windows)
```

### مراقبة التغييرات:
```python
# إضافة مراقبة للملفات الجديدة
import watchdog
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
```

---

## 🎯 النتيجة النهائية

بعد اتباع هذا الدليل، ستحصل على:
- ✅ زاحف قوانين فلسطينية متقدم
- ✅ نظام RAG للبحث الدلالي
- ✅ API RESTful للاستعلامات
- ✅ وثائق قانونية محدثة
- ✅ استشهادات دقيقة للتحليلات

**الخطوة التالية**: دمج النظام مع الواجهة الأمامية! 🚀
