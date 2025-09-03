import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LegalDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'txt' | 'other';
  size: number;
  caseId?: string;
  caseName?: string;
  description?: string;
  category: 'contract' | 'evidence' | 'correspondence' | 'legal_opinion' | 'court_document' | 'other';
  uploadedAt: string;
  lastModified: string;
  tags?: string[];
  isPublic: boolean;
  filePath?: string;
  mimeType?: string;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
}

export default function DocumentPreviewModal({ isOpen, onClose, document }: DocumentPreviewModalProps) {
  const { theme } = useTheme();
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && document) {
      loadPreview();
    }
  }, [isOpen, document]);

  const loadPreview = async () => {
    if (!document) return;

    setLoading(true);
    setError('');

    try {
      // Simulate loading preview content
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock preview content based on document type
      const mockContent = generateMockPreview(document);
      setPreviewContent(mockContent);
    } catch (error) {
      console.error('Error loading preview:', error);
      setError('حدث خطأ أثناء تحميل معاينة المستند');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPreview = (doc: LegalDocument): string => {
    switch (doc.type) {
      case 'pdf':
        return `
          <div style="text-align: center; padding: 40px; background: #f5f5f5; border-radius: 8px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
            <h3>معاينة PDF</h3>
            <p>هذا مستند PDF يحتوي على ${Math.floor(doc.size / 1024)} صفحة تقريباً</p>
            <p>تم رفعه في: ${new Date(doc.uploadedAt).toLocaleDateString('ar-SA')}</p>
            <p>الحجم: ${formatFileSize(doc.size)}</p>
            <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 4px; text-align: right;">
              <h4>محتوى المستند:</h4>
              <p>هذا مثال على محتوى المستند. في التطبيق الحقيقي، سيتم عرض محتوى PDF الفعلي هنا.</p>
              <p>يمكن إضافة مكتبات مثل PDF.js لعرض المستندات بشكل كامل.</p>
            </div>
          </div>
        `;
      
      case 'doc':
      case 'docx':
        return `
          <div style="text-align: center; padding: 40px; background: #f5f5f5; border-radius: 8px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
            <h3>معاينة مستند Word</h3>
            <p>هذا مستند Word يحتوي على نص وثائق</p>
            <p>تم رفعه في: ${new Date(doc.uploadedAt).toLocaleDateString('ar-SA')}</p>
            <p>الحجم: ${formatFileSize(doc.size)}</p>
            <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 4px; text-align: right;">
              <h4>محتوى المستند:</h4>
              <p>هذا مثال على محتوى مستند Word. في التطبيق الحقيقي، سيتم تحويل المستند إلى HTML أو PDF للعرض.</p>
              <p>يمكن استخدام مكتبات مثل mammoth.js لتحويل ملفات Word إلى HTML.</p>
            </div>
          </div>
        `;
      
      case 'jpg':
      case 'jpeg':
      case 'png':
        return `
          <div style="text-align: center; padding: 40px; background: #f5f5f5; border-radius: 8px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🖼️</div>
            <h3>معاينة صورة</h3>
            <p>هذه صورة من نوع ${doc.type.toUpperCase()}</p>
            <p>تم رفعها في: ${new Date(doc.uploadedAt).toLocaleDateString('ar-SA')}</p>
            <p>الحجم: ${formatFileSize(doc.size)}</p>
            <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 4px;">
              <div style="width: 200px; height: 150px; background: #ddd; border-radius: 4px; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #666;">
                معاينة الصورة
              </div>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">
                في التطبيق الحقيقي، ستظهر الصورة الفعلية هنا
              </p>
            </div>
          </div>
        `;
      
      case 'txt':
        return `
          <div style="text-align: center; padding: 40px; background: #f5f5f5; border-radius: 8px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📃</div>
            <h3>معاينة ملف نصي</h3>
            <p>هذا ملف نصي عادي</p>
            <p>تم رفعه في: ${new Date(doc.uploadedAt).toLocaleDateString('ar-SA')}</p>
            <p>الحجم: ${formatFileSize(doc.size)}</p>
            <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 4px; text-align: right;">
              <h4>محتوى الملف:</h4>
              <pre style="background: #f8f8f8; padding: 15px; border-radius: 4px; text-align: right; direction: rtl;">
هذا مثال على محتوى ملف نصي.
يمكن أن يحتوي على أي نص عادي.
في التطبيق الحقيقي، سيتم عرض محتوى الملف الفعلي هنا.

تاريخ الإنشاء: ${new Date(doc.uploadedAt).toLocaleString('ar-SA')}
آخر تعديل: ${new Date(doc.lastModified).toLocaleString('ar-SA')}
              </pre>
            </div>
          </div>
        `;
      
      default:
        return `
          <div style="text-align: center; padding: 40px; background: #f5f5f5; border-radius: 8px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
            <h3>معاينة مستند</h3>
            <p>نوع الملف: ${doc.type}</p>
            <p>تم رفعه في: ${new Date(doc.uploadedAt).toLocaleDateString('ar-SA')}</p>
            <p>الحجم: ${formatFileSize(doc.size)}</p>
            <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 4px;">
              <p>هذا النوع من الملفات لا يدعم المعاينة المباشرة.</p>
              <p>يمكنك تحميل الملف لعرضه باستخدام التطبيق المناسب.</p>
            </div>
          </div>
        `;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'contract': return 'عقد';
      case 'evidence': return 'دليل';
      case 'correspondence': return 'مراسلة';
      case 'legal_opinion': return 'رأي قانوني';
      case 'court_document': return 'مستند قضائي';
      default: return 'أخرى';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contract': return '#3b82f6';
      case 'evidence': return '#ef4444';
      case 'correspondence': return '#10b981';
      case 'legal_opinion': return '#f59e0b';
      case 'court_document': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const handleDownload = () => {
    if (!document) return;
    
    // TODO: Implement actual download functionality
    alert(`تحميل المستند: ${document.name}`);
  };

  const handlePrint = () => {
    if (!document) return;
    
    // TODO: Implement print functionality
    alert(`طباعة المستند: ${document.name}`);
  };

  if (!isOpen || !document) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: theme.card,
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: `0 4px 20px ${theme.shadow}`,
        border: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              color: theme.text,
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              wordBreak: 'break-word'
            }}>
              {document.name}
            </h2>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#fff',
                background: getCategoryColor(document.category)
              }}>
                {getCategoryLabel(document.category)}
              </span>
              {document.caseName && (
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#fff',
                  background: theme.accent2
                }}>
                  {document.caseName}
                </span>
              )}
              <span style={{
                color: theme.text,
                fontSize: '12px',
                opacity: 0.7
              }}>
                {formatFileSize(document.size)}
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              onClick={handleDownload}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: theme.accent2,
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⬇️ تحميل
            </button>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🖨️ طباعة
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.text,
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: theme.text
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
                <p>جاري تحميل معاينة المستند...</p>
              </div>
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#ef4444'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>❌</div>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div 
              dangerouslySetInnerHTML={{ __html: previewContent }}
              style={{
                lineHeight: '1.6',
                color: theme.text
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${theme.border}`,
          background: theme.resultBg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: theme.text,
          opacity: 0.7
        }}>
          <div>
            رفع: {new Date(document.uploadedAt).toLocaleString('ar-SA')}
          </div>
          <div>
            تعديل: {new Date(document.lastModified).toLocaleString('ar-SA')}
          </div>
        </div>
      </div>
    </div>
  );
}
