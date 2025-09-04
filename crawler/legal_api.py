#!/usr/bin/env python3
"""
API للبحث في القوانين الفلسطينية
Palestinian Legal Search API
"""

import json
import sys
import pathlib
from typing import Dict, List, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
import argparse

# إضافة مسار النظام للوصول إلى rag_system.py
sys.path.append(str(pathlib.Path(__file__).parent))

try:
    from rag_system import PalestinianLegalRAG
    RAG_AVAILABLE = True
except ImportError as e:
    print(f"❌ خطأ في استيراد نظام RAG: {e}")
    RAG_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # السماح بالطلبات من الواجهة الأمامية

# متغير عام للنظام
rag_system: Optional[PalestinianLegalRAG] = None

@app.route('/health', methods=['GET'])
def health_check():
    """فحص صحة النظام"""
    return jsonify({
        'status': 'healthy',
        'rag_available': RAG_AVAILABLE,
        'system_loaded': rag_system is not None,
        'documents_count': len(rag_system.documents) if rag_system else 0
    })

@app.route('/api/search', methods=['POST'])
def search_laws():
    """البحث في القوانين"""
    if not rag_system:
        return jsonify({
            'error': 'نظام RAG غير محمل',
            'status': 'error'
        }), 500
    
    try:
        data = request.get_json()
        query = data.get('query', '')
        top_k = data.get('top_k', 5)
        
        if not query.strip():
            return jsonify({
                'error': 'الاستعلام مطلوب',
                'status': 'error'
            }), 400
        
        # البحث في القوانين
        results = rag_system.search(query, top_k=top_k)
        
        # تحويل النتائج إلى JSON
        search_results = []
        for result in results:
            search_results.append({
                'title': result.document.title,
                'excerpt': result.excerpt,
                'source_url': result.document.source_url,
                'similarity_score': result.similarity_score,
                'document_type': result.document.document_type,
                'jurisdiction': result.document.jurisdiction,
                'document_id': result.document.id
            })
        
        return jsonify({
            'status': 'success',
            'query': query,
            'results': search_results,
            'total_found': len(search_results)
        })
        
    except Exception as e:
        return jsonify({
            'error': f'خطأ في البحث: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/context', methods=['POST'])
def get_legal_context():
    """الحصول على السياق القانوني"""
    if not rag_system:
        return jsonify({
            'error': 'نظام RAG غير محمل',
            'status': 'error'
        }), 500
    
    try:
        data = request.get_json()
        query = data.get('query', '')
        max_results = data.get('max_results', 3)
        
        if not query.strip():
            return jsonify({
                'error': 'الاستعلام مطلوب',
                'status': 'error'
            }), 400
        
        # الحصول على السياق القانوني
        context = rag_system.get_legal_context(query, max_results=max_results)
        
        return jsonify({
            'status': 'success',
            'query': query,
            'context': context
        })
        
    except Exception as e:
        return jsonify({
            'error': f'خطأ في الحصول على السياق: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/documents', methods=['GET'])
def list_documents():
    """قائمة الوثائق المتوفرة"""
    if not rag_system:
        return jsonify({
            'error': 'نظام RAG غير محمل',
            'status': 'error'
        }), 500
    
    try:
        documents = []
        for doc in rag_system.documents:
            documents.append({
                'id': doc.id,
                'title': doc.title,
                'document_type': doc.document_type,
                'jurisdiction': doc.jurisdiction,
                'source_url': doc.source_url,
                'content_length': len(doc.content)
            })
        
        return jsonify({
            'status': 'success',
            'documents': documents,
            'total_count': len(documents)
        })
        
    except Exception as e:
        return jsonify({
            'error': f'خطأ في قائمة الوثائق: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/document/<doc_id>', methods=['GET'])
def get_document(doc_id: str):
    """الحصول على وثيقة محددة"""
    if not rag_system:
        return jsonify({
            'error': 'نظام RAG غير محمل',
            'status': 'error'
        }), 500
    
    try:
        # البحث عن الوثيقة
        for doc in rag_system.documents:
            if doc.id == doc_id:
                return jsonify({
                    'status': 'success',
                    'document': {
                        'id': doc.id,
                        'title': doc.title,
                        'content': doc.content,
                        'document_type': doc.document_type,
                        'jurisdiction': doc.jurisdiction,
                        'source_url': doc.source_url,
                        'issued_at': doc.issued_at,
                        'metadata': doc.metadata
                    }
                })
        
        return jsonify({
            'error': 'الوثيقة غير موجودة',
            'status': 'error'
        }), 404
        
    except Exception as e:
        return jsonify({
            'error': f'خطأ في الحصول على الوثيقة: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/add_document', methods=['POST'])
def add_document():
    """إضافة وثيقة جديدة"""
    if not rag_system:
        return jsonify({
            'error': 'نظام RAG غير محمل',
            'status': 'error'
        }), 500
    
    try:
        data = request.get_json()
        title = data.get('title', '')
        content = data.get('content', '')
        source_url = data.get('source_url', '')
        doc_type = data.get('document_type', 'law')
        
        if not title or not content:
            return jsonify({
                'error': 'العنوان والمحتوى مطلوبان',
                'status': 'error'
            }), 400
        
        # إضافة الوثيقة
        rag_system.add_document(title, content, source_url, doc_type)
        
        return jsonify({
            'status': 'success',
            'message': 'تم إضافة الوثيقة بنجاح'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'خطأ في إضافة الوثيقة: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/rebuild_embeddings', methods=['POST'])
def rebuild_embeddings():
    """إعادة بناء Embeddings"""
    if not rag_system:
        return jsonify({
            'error': 'نظام RAG غير محمل',
            'status': 'error'
        }), 500
    
    try:
        # إعادة بناء Embeddings
        rag_system.build_embeddings()
        
        return jsonify({
            'status': 'success',
            'message': 'تم إعادة بناء Embeddings بنجاح'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'خطأ في إعادة بناء Embeddings: {str(e)}',
            'status': 'error'
        }), 500

def initialize_rag_system(corpus_path: str):
    """تهيئة نظام RAG"""
    global rag_system
    
    try:
        print(f"🔧 تهيئة نظام RAG مع المجموعة: {corpus_path}")
        rag_system = PalestinianLegalRAG(corpus_path)
        
        if RAG_AVAILABLE and rag_system.model:
            print("🔧 بناء Embeddings...")
            rag_system.build_embeddings()
            print("✅ تم تهيئة النظام بنجاح")
        else:
            print("⚠️  النظام يعمل بدون Embeddings (البحث النصي فقط)")
            
    except Exception as e:
        print(f"❌ خطأ في تهيئة النظام: {e}")
        rag_system = None

def main():
    """تشغيل الخادم"""
    parser = argparse.ArgumentParser(description='API للبحث في القوانين الفلسطينية')
    parser.add_argument('--corpus', default='out/corpus.jsonl', 
                       help='مسار ملف المجموعة القانونية')
    parser.add_argument('--host', default='localhost', 
                       help='عنوان الخادم')
    parser.add_argument('--port', type=int, default=5001, 
                       help='منفذ الخادم')
    parser.add_argument('--debug', action='store_true', 
                       help='وضع التطوير')
    
    args = parser.parse_args()
    
    # تهيئة النظام
    initialize_rag_system(args.corpus)
    
    if not rag_system:
        print("❌ فشل في تهيئة النظام")
        return
    
    print(f"🚀 تشغيل خادم API على http://{args.host}:{args.port}")
    print("📚 نقاط النهاية المتوفرة:")
    print("  GET  /health                    - فحص صحة النظام")
    print("  POST /api/search                - البحث في القوانين")
    print("  POST /api/context                - السياق القانوني")
    print("  GET  /api/documents              - قائمة الوثائق")
    print("  GET  /api/document/<id>          - وثيقة محددة")
    print("  POST /api/add_document           - إضافة وثيقة")
    print("  POST /api/rebuild_embeddings     - إعادة بناء Embeddings")
    
    # تشغيل الخادم
    app.run(
        host=args.host,
        port=args.port,
        debug=args.debug
    )

if __name__ == "__main__":
    main()
