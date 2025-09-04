# دليل دمج RAG مع النظام الرئيسي 🚀

## 🎯 الوضع الحالي
✅ نظام RAG يعمل بنجاح مع 147 وثيقة قانونية  
✅ Embeddings مبنية لـ 22,087 جزء نصي  
✅ بحث دلالي يعمل بشكل صحيح  

## 🔧 الخطوات التالية للدمج

### 1. **تحديث API التحليل الرئيسي**

أضف إلى `frontend/pages/api/analyze.ts`:

```typescript
// إضافة استيراد RAG
import { getLegalContext } from '../../../crawler/rag_system';

// تحديث دالة التحليل
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { stageId, caseData } = req.body;
    
    // الحصول على السياق القانوني من RAG
    const legalContext = await getLegalContext(stageId, caseData);
    
    // دمج السياق مع البرومبت
    const enhancedPrompt = buildRAGEnhancedPrompt(stageId, caseData, legalContext);
    
    // إرسال للذكاء الاصطناعي
    const response = await analyzeWithGemini(enhancedPrompt);
    
    res.json({ success: true, analysis: response, context: legalContext });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 2. **إنشاء واجهة إدارة القوانين**

أضف صفحة جديدة `frontend/pages/legal-corpus.tsx`:

```typescript
import { useState, useEffect } from 'react';

export default function LegalCorpus() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // البحث في القوانين
  const searchLaws = async (query: string) => {
    const response = await fetch('/api/legal/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: 5 })
    });
    const data = await response.json();
    setSearchResults(data.results);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">قاعدة المعرفة القانونية</h1>
      
      {/* البحث */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="ابحث في القوانين..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <button
          onClick={() => searchLaws(searchQuery)}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          بحث
        </button>
      </div>

      {/* النتائج */}
      <div className="grid gap-4">
        {searchResults.map((result, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="font-bold">{result.title}</h3>
            <p className="text-sm text-gray-600">{result.excerpt}</p>
            <p className="text-xs text-gray-500">التشابه: {result.similarity_score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. **إضافة API للبحث القانوني**

أضف `frontend/pages/api/legal/search.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, top_k = 5 } = req.body;
    
    // الاتصال بخادم RAG
    const response = await fetch('http://localhost:5001/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 4. **تحديث القائمة الجانبية**

أضف رابط لقاعدة المعرفة في `frontend/components/SmartSidebar.tsx`:

```typescript
// إضافة رابط جديد
{
  name: 'قاعدة المعرفة',
  href: '/legal-corpus',
  icon: '📚',
  description: 'البحث في القوانين الفلسطينية'
}
```

## 🚀 تشغيل النظام المتكامل

### 1. **تشغيل خادم RAG**
```bash
cd crawler
python legal_api_simple.py --corpus out/corpus.jsonl --port 5001 --debug
```

### 2. **تشغيل النظام الرئيسي**
```bash
cd frontend
npm run dev
```

### 3. **اختبار التكامل**
- افتح `http://localhost:3000/legal-corpus`
- جرب البحث في القوانين
- اختبر التحليل مع السياق القانوني

## 📊 قياسات الأداء

### قبل RAG:
- تحليل عام بدون مراجع قانونية محددة
- دقة متوسطة للتحليلات القانونية
- عدم وجود استشهادات موثقة

### بعد RAG:
- ✅ تحليل مبني على قوانين فلسطينية فعلية
- ✅ استشهادات دقيقة بالمراجع القانونية
- ✅ سياق قانوني غني للتحليلات
- ✅ 147 وثيقة قانونية متاحة للبحث

## 🔄 التحديثات المستقبلية

### المرحلة التالية:
1. **إضافة المزيد من المصادر** (500+ قانون)
2. **تحسين دقة البحث** (تحسين Embeddings)
3. **إضافة تصنيف تلقائي** للوثائق
4. **تحديث تلقائي** للقوانين الجديدة
5. **واجهة إدارة متقدمة** للقوانين

## 🎯 النتيجة النهائية

بعد هذا الدمج، ستحصل على:
- **نظام تحليل قانوني متقدم** مبني على قوانين فلسطينية فعلية
- **استشهادات موثقة** لكل تحليل قانوني
- **بحث دلالي سريع** في القوانين
- **سياق قانوني غني** للذكاء الاصطناعي
- **واجهة سهلة الاستخدام** لإدارة المعرفة القانونية

**هذا يجعل النظام أقوى بكثير من الاعتماد على المعرفة العامة للذكاء الاصطناعي!** 🏛️✨
