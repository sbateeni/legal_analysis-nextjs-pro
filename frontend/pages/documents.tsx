import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, getAllDocuments, addDocument, deleteDocument } from '@utils/db';
import FileUploadModal from '../components/FileUploadModal';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import Link from 'next/link';

// تعريف أنواع البيانات
interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

interface LegalCase {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  caseType?: string;
  clientName?: string;
  courtName?: string;
  nextHearing?: string;
  notes?: string;
}

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
}

export default function DocumentsPage() {
  return <DocumentsPageContent />;
}

function DocumentsPageContent() {
  const { theme } = useTheme();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allCases = await getAllCases();
      const formattedCases: LegalCase[] = allCases.map((c: any) => ({
        ...c,
        status: c.status || 'active',
        priority: c.priority || 'medium',
        caseType: c.caseType || 'غير محدد',
        clientName: c.clientName || '',
        courtName: c.courtName || '',
        nextHearing: c.nextHearing || '',
        notes: c.notes || '',
      }));
      setCases(formattedCases);

      const allDocuments = await getAllDocuments();
      setDocuments(allDocuments);
    } catch (error) {
      console.error('Error loading documents data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesUploaded = () => {
    loadData(); // إعادة تحميل البيانات
  };

  const getFileType = (filename: string): LegalDocument['type'] => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'doc': return 'doc';
      case 'docx': return 'docx';
      case 'jpg':
      case 'jpeg': return 'jpg';
      case 'png': return 'png';
      case 'txt': return 'txt';
      default: return 'other';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'txt': return '📃';
      default: return '📁';
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesCase = selectedCase === 'all' || doc.caseId === selectedCase;
      return matchesSearch && matchesCategory && matchesCase;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      try {
        await deleteDocument(documentId);
        loadData();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('حدث خطأ أثناء حذف المستند');
      }
    }
  };

  const handlePreviewDocument = (document: LegalDocument) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  if (loading) {
    return (
      <div style={{
        background: theme.background,
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          background: theme.card,
          padding: '40px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          textAlign: 'center',
          color: theme.text
        }}>
          جاري تحميل المستندات...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.background,
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: theme.card,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          marginBottom: '24px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h1 style={{
              color: theme.text,
              margin: '0',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              📁 إدارة المستندات
            </h1>
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📤 رفع مستندات
            </button>
          </div>

          {/* Filters and Search */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              placeholder="🔍 البحث في المستندات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="all">جميع الفئات</option>
              <option value="contract">عقد</option>
              <option value="evidence">دليل</option>
              <option value="correspondence">مراسلة</option>
              <option value="legal_opinion">رأي قانوني</option>
              <option value="court_document">مستند قضائي</option>
              <option value="other">أخرى</option>
            </select>

            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="all">جميع القضايا</option>
              {cases.map(caseItem => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.name}
                </option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="date-desc">الأحدث أولاً</option>
              <option value="date-asc">الأقدم أولاً</option>
              <option value="name-asc">الاسم (أ-ي)</option>
              <option value="name-desc">الاسم (ي-أ)</option>
              <option value="size-desc">الأكبر أولاً</option>
              <option value="size-asc">الأصغر أولاً</option>
              <option value="type-asc">النوع (أ-ي)</option>
            </select>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: theme.accent2,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              إجمالي المستندات: {documents.length}
            </div>
            <div style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: theme.accent2,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              المعروضة: {filteredAndSortedDocuments.length}
            </div>
            <div style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: theme.accent2,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              الحجم الإجمالي: {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredAndSortedDocuments.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {filteredAndSortedDocuments.map((document) => (
              <div key={document.id} style={{
                background: theme.card,
                borderRadius: '12px',
                padding: '20px',
                boxShadow: `0 4px 20px ${theme.shadow}`,
                border: `1px solid ${theme.border}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${theme.shadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 20px ${theme.shadow}`;
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '32px' }}>
                    {getFileIcon(document.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: theme.text,
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      wordBreak: 'break-word'
                    }}>
                      {document.name}
                    </h3>
                    <p style={{
                      color: theme.text,
                      margin: '0',
                      fontSize: '12px',
                      opacity: 0.7
                    }}>
                      {formatFileSize(document.size)} • {document.type.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '12px',
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
                </div>

                {document.description && (
                  <p style={{
                    color: theme.text,
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    opacity: 0.8,
                    lineHeight: '1.4'
                  }}>
                    {document.description}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <p style={{
                    color: theme.text,
                    margin: '0',
                    fontSize: '12px',
                    opacity: 0.6
                  }}>
                    رفع: {new Date(document.uploadedAt).toLocaleDateString('ar-SA')}
                  </p>
                  <p style={{
                    color: theme.text,
                    margin: '0',
                    fontSize: '12px',
                    opacity: 0.6
                  }}>
                    تعديل: {new Date(document.lastModified).toLocaleDateString('ar-SA')}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => handlePreviewDocument(document)}
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
                    👁️ معاينة
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement document download
                      alert('تحميل المستند قيد التطوير');
                    }}
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
                    ⬇️ تحميل
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: theme.card,
            padding: '60px 20px',
            borderRadius: '12px',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            border: `1px solid ${theme.border}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
              📁
            </div>
            <h3 style={{
              color: theme.text,
              margin: '0 0 12px 0',
              fontSize: '20px'
            }}>
              لا توجد مستندات
            </h3>
            <p style={{
              color: theme.text,
              margin: '0 0 20px 0',
              fontSize: '16px',
              opacity: 0.7
            }}>
              ابدأ برفع مستنداتك الأولى لإدارة أفضل لقضاياك
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📤 رفع مستندات
            </button>
          </div>
        )}

        {/* Upload Modal */}
        <FileUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFilesUploaded={handleFilesUploaded}
        />

        {/* Preview Modal */}
        <DocumentPreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      </div>
    </div>
  );
}
