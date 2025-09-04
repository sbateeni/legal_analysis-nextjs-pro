import os
import json
import hashlib

def create_corpus_from_texts():
    """إنشاء ملف corpus.jsonl من الملفات النصية"""
    texts_dir = "out/texts"
    corpus_file = "out/corpus.jsonl"
    
    if not os.path.exists(texts_dir):
        print(f"مجلد {texts_dir} غير موجود")
        return
    
    documents = []
    
    # قراءة جميع الملفات النصية
    for filename in os.listdir(texts_dir):
        if filename.endswith('.txt'):
            filepath = os.path.join(texts_dir, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                
                if content:
                    # استخراج العنوان من اسم الملف
                    title = filename.replace('.txt', '').strip()
                    
                    # إنشاء معرف فريد
                    doc_id = hashlib.md5(title.encode()).hexdigest()[:8]
                    
                    # تحديد نوع الوثيقة
                    doc_type = 'law_or_regulation'
                    if 'قضية' in title:
                        doc_type = 'court_decision'
                    elif 'محكمة' in title:
                        doc_type = 'court_decision'
                    elif 'قانون' in title:
                        doc_type = 'law'
                    elif 'مرسوم' in title:
                        doc_type = 'decree'
                    
                    document = {
                        "id": doc_id,
                        "title": title,
                        "body": content,
                        "type": doc_type,
                        "jurisdiction": "PS",
                        "source_url": "",
                        "metadata": {
                            "filename": filename,
                            "file_size": len(content),
                            "word_count": len(content.split())
                        }
                    }
                    
                    documents.append(document)
                    print(f"تم إضافة: {title}")
                    
            except Exception as e:
                print(f"خطأ في قراءة {filename}: {e}")
    
    # حفظ في ملف corpus.jsonl
    try:
        with open(corpus_file, 'w', encoding='utf-8') as f:
            for doc in documents:
                f.write(json.dumps(doc, ensure_ascii=False) + '\n')
        
        print(f"\n✅ تم إنشاء {corpus_file} بنجاح")
        print(f"📊 عدد الوثائق: {len(documents)}")
        
    except Exception as e:
        print(f"خطأ في حفظ {corpus_file}: {e}")

if __name__ == "__main__":
    create_corpus_from_texts()
