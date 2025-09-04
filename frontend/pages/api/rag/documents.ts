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

// قائمة الوثائق المتوفرة
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const documents = loadCorpus();
    
    const formattedDocs = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      document_type: doc.type || 'law_or_regulation',
      jurisdiction: doc.jurisdiction || 'PS',
      source_url: doc.source_url || '',
      content_length: doc.body ? doc.body.length : 0
    }));
    
    res.json({
      status: 'success',
      documents: formattedDocs,
      total_count: formattedDocs.length
    });
  } catch (error) {
    console.error('RAG Documents Error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'خطأ في تحميل قائمة الوثائق',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}
