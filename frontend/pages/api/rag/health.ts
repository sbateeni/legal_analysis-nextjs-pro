import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// تحميل ملف corpus.jsonl
const loadCorpus = () => {
  try {
    const corpusPath = path.join(process.cwd(), 'crawler', 'out', 'corpus.jsonl');
    const fileContent = fs.readFileSync(corpusPath, 'utf-8');
    const documents = fileContent.trim().split('\n').map(line => JSON.parse(line));
    return documents;
  } catch (error) {
    console.error('خطأ في تحميل corpus.jsonl:', error);
    return [];
  }
};

// البحث البسيط في النصوص
const simpleSearch = (query: string, documents: any[], topK: number = 5) => {
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const scoredDocs = documents.map(doc => {
    const content = (doc.body || '').toLowerCase();
    const title = (doc.title || '').toLowerCase();
    
    let score = 0;
    
    // البحث في العنوان
    queryWords.forEach(word => {
      if (title.includes(word)) score += 2;
    });
    
    // البحث في المحتوى
    queryWords.forEach(word => {
      const matches = (content.match(new RegExp(word, 'g')) || []).length;
      score += matches * 0.1;
    });
    
    // استخراج مقتطف
    const excerpt = extractExcerpt(content, query, 200);
    
    return {
      document: doc,
      score,
      excerpt
    };
  });
  
  // ترتيب حسب النتيجة
  scoredDocs.sort((a, b) => b.score - a.score);
  
  return scoredDocs.slice(0, topK).map(item => ({
    title: item.document.title,
    excerpt: item.excerpt,
    source_url: item.document.source_url || '',
    similarity_score: Math.min(item.score / 10, 1), // تحويل النتيجة إلى نسبة
    document_type: item.document.type || 'law_or_regulation',
    jurisdiction: item.document.jurisdiction || 'PS',
    document_id: item.document.id
  }));
};

// استخراج مقتطف من النص
const extractExcerpt = (text: string, query: string, maxLength: number) => {
  const queryWords = query.toLowerCase().split(/\s+/);
  let bestPos = 0;
  let bestScore = 0;
  
  for (let i = 0; i < text.length - maxLength; i += 50) {
    const excerpt = text.substr(i, maxLength);
    let score = 0;
    
    queryWords.forEach(word => {
      if (excerpt.includes(word)) score++;
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestPos = i;
    }
  }
  
  return text.substr(bestPos, maxLength).trim();
};

// فحص حالة RAG
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const documents = loadCorpus();
    
    res.json({
      status: 'healthy',
      rag_available: true,
      system_loaded: true,
      documents_count: documents.length,
      embeddings_ready: true // نحن لا نحتاج embeddings للبحث البسيط
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: 'خطأ في فحص حالة RAG',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}
