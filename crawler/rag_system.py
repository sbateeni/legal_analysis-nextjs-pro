#!/usr/bin/env python3
"""
نظام RAG للقانون الفلسطيني
Retrieval-Augmented Generation System for Palestinian Law
"""

import json
import pathlib
import re
from typing import List, Dict, Optional, Tuple
import numpy as np
from dataclasses import dataclass
import hashlib

try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    print("⚠️  تثبيت sentence-transformers مطلوب: pip install sentence-transformers")

@dataclass
class LawDocument:
    """وثيقة قانونية"""
    id: str
    title: str
    content: str
    source_url: str
    document_type: str  # 'law', 'decision', 'regulation'
    jurisdiction: str = "PS"
    issued_at: Optional[str] = None
    metadata: Dict = None

@dataclass
class SearchResult:
    """نتيجة بحث"""
    document: LawDocument
    similarity_score: float
    excerpt: str
    start_pos: int
    end_pos: int

class PalestinianLegalRAG:
    """نظام RAG للقانون الفلسطيني"""
    
    def __init__(self, corpus_path: str = "corpus.jsonl"):
        self.corpus_path = pathlib.Path(corpus_path)
        self.documents: List[LawDocument] = []
        self.embeddings = None
        self.model = None
        
        if RAG_AVAILABLE:
            self._load_model()
        
        self._load_corpus()
    
    def _load_model(self):
        """تحميل نموذج Embeddings للعربية"""
        try:
            # نموذج متعدد اللغات يدعم العربية
            self.model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
            print("✅ تم تحميل نموذج Embeddings بنجاح")
        except Exception as e:
            print(f"❌ خطأ في تحميل النموذج: {e}")
            self.model = None
    
    def _load_corpus(self):
        """تحميل مجموعة القوانين"""
        if not self.corpus_path.exists():
            print(f"❌ ملف المجموعة غير موجود: {self.corpus_path}")
            return
        
        print(f"📚 تحميل مجموعة القوانين من {self.corpus_path}")
        
        with open(self.corpus_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    data = json.loads(line.strip())
                    
                    # تنظيف النص العربي
                    content = self._clean_arabic_text(data.get('body', ''))
                    if len(content.strip()) < 100:  # تجاهل النصوص القصيرة
                        continue
                    
                    doc = LawDocument(
                        id=data.get('id', str(line_num)),
                        title=data.get('title', 'وثيقة قانونية'),
                        content=content,
                        source_url=data.get('source_url', ''),
                        document_type=data.get('type', 'law_or_regulation'),
                        jurisdiction=data.get('jurisdiction', 'PS'),
                        issued_at=data.get('issued_at'),
                        metadata={
                            'filename': data.get('filename'),
                            'text_file': data.get('text_file'),
                            'version': data.get('version', 1)
                        }
                    )
                    self.documents.append(doc)
                    
                except json.JSONDecodeError as e:
                    print(f"⚠️  خطأ في السطر {line_num}: {e}")
                    continue
        
        print(f"✅ تم تحميل {len(self.documents)} وثيقة قانونية")
    
    def _clean_arabic_text(self, text: str) -> str:
        """تنظيف النص العربي"""
        if not text:
            return ""
        
        # إزالة الأحرف الخاصة والرموز
        text = re.sub(r'[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\w\d\.\,\;\:\!\?\(\)\[\]\{\}]', ' ', text)
        
        # إزالة المسافات المتعددة
        text = re.sub(r'\s+', ' ', text)
        
        # إزالة الأسطر الفارغة المتعددة
        text = re.sub(r'\n\s*\n', '\n', text)
        
        return text.strip()
    
    def _create_chunks(self, text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
        """تقسيم النص إلى أجزاء مع الحفاظ على السياق"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # محاولة قطع عند نهاية جملة
            if end < len(text):
                # البحث عن أقرب نقطة أو علامة استفهام
                for punct in ['.', '؟', '!', '\n']:
                    last_punct = text.rfind(punct, start, end)
                    if last_punct > start + chunk_size // 2:
                        end = last_punct + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            if start >= len(text):
                break
        
        return chunks
    
    def _extract_excerpt(self, text: str, query: str, max_length: int = 200) -> Tuple[str, int, int]:
        """استخراج مقتطف ذو صلة بالاستعلام"""
        # البحث عن الكلمات المفتاحية في النص
        query_words = query.split()
        
        best_pos = 0
        best_score = 0
        
        for i in range(0, len(text) - max_length, 50):
            excerpt = text[i:i + max_length]
            score = sum(1 for word in query_words if word in excerpt)
            
            if score > best_score:
                best_score = score
                best_pos = i
        
        start_pos = best_pos
        end_pos = min(best_pos + max_length, len(text))
        
        # محاولة قطع عند نهاية جملة
        for punct in ['.', '؟', '!', '\n']:
            last_punct = text.rfind(punct, start_pos, end_pos)
            if last_punct > start_pos + max_length // 2:
                end_pos = last_punct + 1
                break
        
        return text[start_pos:end_pos].strip(), start_pos, end_pos
    
    def build_embeddings(self):
        """بناء Embeddings للمجموعة"""
        if not self.model or not self.documents:
            print("❌ النموذج أو المجموعة غير متوفرة")
            return
        
        print("🔧 بناء Embeddings للمجموعة...")
        
        all_chunks = []
        chunk_to_doc = []
        
        for doc in self.documents:
            chunks = self._create_chunks(doc.content)
            all_chunks.extend(chunks)
            chunk_to_doc.extend([doc] * len(chunks))
        
        # إنشاء Embeddings
        embeddings = self.model.encode(all_chunks, show_progress_bar=True)
        
        self.embeddings = embeddings
        self.chunk_to_doc = chunk_to_doc
        self.all_chunks = all_chunks
        
        print(f"✅ تم بناء Embeddings لـ {len(all_chunks)} جزء")
    
    def search(self, query: str, top_k: int = 5) -> List[SearchResult]:
        """البحث في القوانين"""
        if not self.embeddings is not None:
            print("❌ يجب بناء Embeddings أولاً")
            return []
        
        # تنظيف الاستعلام
        clean_query = self._clean_arabic_text(query)
        
        # إنشاء Embedding للاستعلام
        query_embedding = self.model.encode([clean_query])
        
        # حساب التشابه
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]
        
        # ترتيب النتائج
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        seen_docs = set()
        
        for idx in top_indices:
            doc = self.chunk_to_doc[idx]
            chunk = self.all_chunks[idx]
            score = similarities[idx]
            
            # تجنب تكرار نفس الوثيقة
            if doc.id in seen_docs:
                continue
            
            # استخراج مقتطف ذو صلة
            excerpt, start_pos, end_pos = self._extract_excerpt(chunk, clean_query)
            
            result = SearchResult(
                document=doc,
                similarity_score=float(score),
                excerpt=excerpt,
                start_pos=start_pos,
                end_pos=end_pos
            )
            
            results.append(result)
            seen_docs.add(doc.id)
            
            if len(results) >= top_k:
                break
        
        return results
    
    def get_legal_context(self, query: str, max_results: int = 3) -> Dict:
        """الحصول على السياق القانوني للاستعلام"""
        results = self.search(query, top_k=max_results)
        
        context = {
            'relevant_laws': [],
            'court_decisions': [],
            'legal_principles': [],
            'total_documents': len(self.documents)
        }
        
        for result in results:
            doc_info = {
                'title': result.document.title,
                'excerpt': result.excerpt,
                'source_url': result.document.source_url,
                'similarity_score': result.similarity_score,
                'document_type': result.document.document_type
            }
            
            if result.document.document_type in ['law_or_regulation', 'law']:
                context['relevant_laws'].append(doc_info)
            elif result.document.document_type in ['web_page', 'decision']:
                context['court_decisions'].append(doc_info)
            else:
                context['legal_principles'].append(doc_info)
        
        return context
    
    def add_document(self, title: str, content: str, source_url: str, doc_type: str = "law"):
        """إضافة وثيقة جديدة للمجموعة"""
        doc_id = hashlib.sha1(f"{title}{source_url}".encode()).hexdigest()
        
        doc = LawDocument(
            id=doc_id,
            title=title,
            content=self._clean_arabic_text(content),
            source_url=source_url,
            document_type=doc_type
        )
        
        self.documents.append(doc)
        print(f"✅ تم إضافة وثيقة جديدة: {title}")
    
    def save_corpus(self, output_path: str = None):
        """حفظ المجموعة المحدثة"""
        if not output_path:
            output_path = self.corpus_path
        
        with open(output_path, 'w', encoding='utf-8') as f:
            for doc in self.documents:
                data = {
                    'id': doc.id,
                    'title': doc.title,
                    'body': doc.content,
                    'source_url': doc.source_url,
                    'type': doc.document_type,
                    'jurisdiction': doc.jurisdiction,
                    'issued_at': doc.issued_at,
                    'metadata': doc.metadata or {}
                }
                f.write(json.dumps(data, ensure_ascii=False) + '\n')
        
        print(f"✅ تم حفظ المجموعة في {output_path}")


def main():
    """اختبار النظام"""
    print("🏛️  نظام RAG للقانون الفلسطيني")
    print("=" * 50)
    
    # تهيئة النظام
    rag = PalestinianLegalRAG("out/corpus.jsonl")
    
    if not RAG_AVAILABLE:
        print("❌ تثبيت sentence-transformers مطلوب للبحث المتقدم")
        return
    
    # بناء Embeddings
    rag.build_embeddings()
    
    # اختبار البحث
    test_queries = [
        "قانون الملكية العقارية",
        "حقوق العمال",
        "الطلاق والخلع",
        "الجرائم الاقتصادية"
    ]
    
    for query in test_queries:
        print(f"\n🔍 البحث عن: {query}")
        results = rag.search(query, top_k=3)
        
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result.document.title}")
            print(f"     التشابه: {result.similarity_score:.3f}")
            print(f"     المقتطف: {result.excerpt[:100]}...")
            print()


if __name__ == "__main__":
    main()
