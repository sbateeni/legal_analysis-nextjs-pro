import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, updateCase, deleteCase } from '@utils/db';
import { exportResultsToPDF, exportResultsToDocx } from '@utils/export';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
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

const lightTheme = {
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f7f7fa 100%)',
  card: '#fff',
  border: '#e0e7ff',
  accent: '#4f46e5',
  accent2: '#6366f1',
  text: '#222',
  shadow: '#6366f122',
  resultBg: 'linear-gradient(135deg, #f5f7ff 0%, #e0e7ff 100%)',
};

const darkTheme = {
  background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)',
  card: '#232946',
  border: '#393e5c',
  accent: '#a3a8f0',
  accent2: '#6366f1',
  text: '#f7f7fa',
  shadow: '#23294655',
  resultBg: 'linear-gradient(135deg, #232946 0%, #393e5c 100%)',
};

export default function CasesPage() {
  return <CasesPageContent />;
}

function CasesPageContent() {
  const { theme, darkMode } = useTheme();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const allCases = await getAllCases();
      // تحويل البيانات القديمة إلى التنسيق الجديد
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
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCases = cases
    .filter(caseItem => {
      const matchesSearch = caseItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           caseItem.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           caseItem.caseType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || caseItem.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority || 'medium'] || 2) - (priorityOrder[b.priority || 'medium'] || 2);
          break;
        case 'status':
          comparison = a.status?.localeCompare(b.status || 'active') || 0;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCompletionPercentage = (stages: AnalysisStage[]) => {
    const totalStages = 12; // عدد المراحل الأساسية
    const completedStages = stages.length;
    return Math.round((completedStages / totalStages) * 100);
  };

  const handleDeleteCase = async (caseId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      try {
        await deleteCase(caseId);
        setCases(cases.filter(c => c.id !== caseId));
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  const handleExportCase = async (caseItem: LegalCase) => {
    try {
      const stages = caseItem.stages.map(stage => ({
        stage: stage.stage,
        analysis: stage.output
      }));
      
      await exportResultsToPDF(caseItem.name, stages);
    } catch (error) {
      console.error('Error exporting case:', error);
    }
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
          جاري تحميل القضايا...
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
          <h1 style={{
            color: theme.text,
            margin: '0 0 16px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            📋 إدارة القضايا
          </h1>
          <p style={{
            color: theme.text,
            margin: '0 0 24px 0',
            opacity: 0.8
          }}>
            إدارة جميع القضايا القانونية وتتبع تقدمها
          </p>

          {/* Filters and Search */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="🔍 بحث في القضايا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                minWidth: '250px',
                outline: 'none'
              }}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشطة</option>
              <option value="completed">مكتملة</option>
              <option value="archived">مؤرشفة</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="all">جميع الأولويات</option>
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="low">منخفضة</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="date">ترتيب حسب التاريخ</option>
              <option value="name">ترتيب حسب الاسم</option>
              <option value="priority">ترتيب حسب الأولوية</option>
              <option value="status">ترتيب حسب الحالة</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {sortOrder === 'asc' ? '⬆️ تصاعدي' : '⬇️ تنازلي'}
            </button>
          </div>
        </div>

        {/* Cases Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {filteredAndSortedCases.map((caseItem) => (
            <div key={caseItem.id} style={{
              background: theme.card,
              borderRadius: '12px',
              padding: '20px',
              boxShadow: `0 4px 20px ${theme.shadow}`,
              border: `1px solid ${theme.border}`,
              transition: 'transform 0.2s ease'
            }}>
              {/* Case Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: theme.text,
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    {caseItem.name}
                  </h3>
                  <p style={{
                    color: theme.text,
                    margin: '0',
                    fontSize: '14px',
                    opacity: 0.7
                  }}>
                    {caseItem.clientName && `العميل: ${caseItem.clientName}`}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: getStatusColor(caseItem.status || 'active')
                  }}>
                    {caseItem.status === 'active' ? 'نشطة' : 
                     caseItem.status === 'completed' ? 'مكتملة' : 'مؤرشفة'}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: getPriorityColor(caseItem.priority || 'medium')
                  }}>
                    {caseItem.priority === 'high' ? 'عالية' : 
                     caseItem.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </span>
                </div>
              </div>

              {/* Case Details */}
              <div style={{
                marginBottom: '16px'
              }}>
                <p style={{
                  color: theme.text,
                  margin: '0 0 8px 0',
                  fontSize: '14px'
                }}>
                  <strong>نوع القضية:</strong> {caseItem.caseType}
                </p>
                <p style={{
                  color: theme.text,
                  margin: '0 0 8px 0',
                  fontSize: '14px'
                }}>
                  <strong>تاريخ الإنشاء:</strong> {new Date(caseItem.createdAt).toLocaleDateString('ar-SA')}
                </p>
                {caseItem.courtName && (
                  <p style={{
                    color: theme.text,
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                  }}>
                    <strong>المحكمة:</strong> {caseItem.courtName}
                  </p>
                )}
                {caseItem.nextHearing && (
                  <p style={{
                    color: theme.text,
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                  }}>
                    <strong>الجلسة القادمة:</strong> {new Date(caseItem.nextHearing).toLocaleDateString('ar-SA')}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div style={{
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    color: theme.text,
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    التقدم
                  </span>
                  <span style={{
                    color: theme.text,
                    fontSize: '14px'
                  }}>
                    {getCompletionPercentage(caseItem.stages)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: theme.border,
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${getCompletionPercentage(caseItem.stages)}%`,
                    height: '100%',
                    background: theme.accent,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{
                  color: theme.text,
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  opacity: 0.7
                }}>
                  {caseItem.stages.length} من 12 مرحلة مكتملة
                </p>
              </div>

              {/* Tags */}
              {caseItem.tags && caseItem.tags.length > 0 && (
                <div style={{
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    {caseItem.tags.map((tag, index) => (
                      <span key={index} style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background: theme.accent2,
                        color: '#fff'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <Link href={`/cases/${caseItem.id}`}>
                  <button style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: theme.accent,
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    flex: 1
                  }}>
                    👁️ عرض التفاصيل
                  </button>
                </Link>
                
                <button
                  onClick={() => handleExportCase(caseItem)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: theme.accent2,
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  📄 تصدير
                </button>
                
                <button
                  onClick={() => handleDeleteCase(caseItem.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedCases.length === 0 && (
          <div style={{
            background: theme.card,
            padding: '60px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📋
            </div>
            <h3 style={{
              color: theme.text,
              margin: '0 0 8px 0',
              fontSize: '20px'
            }}>
              لا توجد قضايا
            </h3>
            <p style={{
              color: theme.text,
              margin: '0',
              opacity: 0.7
            }}>
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                ? 'جرب تغيير معايير البحث' 
                : 'ابدأ بإنشاء قضية جديدة من الصفحة الرئيسية'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
