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

// الحصول على وثيقة محددة
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { docId } = req.query;
    
    if (!docId || typeof docId !== 'string') {
      return res.status(400).json({ 
        status: 'error',
        error: 'معرف الوثيقة مطلوب' 
      });
    }

    const documents = loadCorpus();
    const document = documents.find(doc => doc.id === docId);
    
    if (!document) {
      return res.status(404).json({ 
        status: 'error',
        error: 'الوثيقة غير موجودة' 
      });
    }
    
    res.json({
      status: 'success',
      document: {
        id: document.id,
        title: document.title,
        content: document.body || '',
        document_type: document.type || 'law_or_regulation',
        jurisdiction: document.jurisdiction || 'PS',
        source_url: document.source_url || '',
        issued_at: document.issued_at,
        metadata: document.metadata || {}
      }
    });
  } catch (error) {
    console.error('RAG Document Error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'خطأ في تحميل الوثيقة',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}
