import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllCases, updateCase, getDocumentsByCase } from '@utils/db';
import { exportResultsToPDF } from '@utils/export';
import Link from 'next/link';
import { 
  SequentialAnalysisManager, 
  createSequentialAnalysisManager, 
  DEFAULT_LEGAL_STAGES,
  AnalysisProgress,
  AnalysisStage as SequentialAnalysisStage
} from '../../utils/sequentialAnalysisManager';

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
  filePath?: string;
  mimeType?: string;
}



export default function CaseDetailPage() {
  return <CaseDetailPageContent />;
}

function CaseDetailPageContent() {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const [caseItem, setCaseItem] = useState<LegalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedCase, setEditedCase] = useState<LegalCase | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'documents' | 'notes'>('overview');
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  
  // Auto analysis state
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);
  const [currentAnalyzingStage, setCurrentAnalyzingStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<AnalysisStage[]>([]);
  const [analysisError, setAnalysisError] = useState('');

  // متغيرات النظام الجديد للتحليل المتسلسل
  const [sequentialAnalysisManager, setSequentialAnalysisManager] = useState<SequentialAnalysisManager | null>(null);
  const [sequentialProgress, setSequentialProgress] = useState<AnalysisProgress | null>(null);
  const [showSequentialProgress, setShowSequentialProgress] = useState(false);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('');
  const [sequentialAnalysisResults, setSequentialAnalysisResults] = useState<SequentialAnalysisStage[]>([]);
  const [canPauseResume, setCanPauseResume] = useState(false);

  useEffect(() => {
    if (id) {
      loadCase();
    }
  }, [id]);

  const loadCase = async () => {
    try {
      const allCases = await getAllCases();
      const foundCase = allCases.find((c: any) => c.id === id);
      if (foundCase) {
        const formattedCase: LegalCase = {
          ...foundCase,
          status: foundCase.status || 'active',
          priority: foundCase.priority || 'medium',
          caseType: foundCase.caseType || 'غير محدد',
          clientName: foundCase.clientName || '',
          courtName: foundCase.courtName || '',
          nextHearing: foundCase.nextHearing || '',
          notes: foundCase.notes || '',
        };
        setCaseItem(formattedCase);
        setEditedCase(formattedCase);

        // Load documents for this case
        const caseDocuments = await getDocumentsByCase(id as string);
        setDocuments(caseDocuments);
      } else {
        router.push('/cases');
      }
    } catch (error) {
      console.error('Error loading case:', error);
      router.push('/cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (editedCase) {
      try {
        await updateCase(editedCase);
        setCaseItem(editedCase);
        setEditing(false);
      } catch (error) {
        console.error('Error updating case:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditedCase(caseItem);
    setEditing(false);
  };

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
    const totalStages = 12;
    const completedStages = stages.length;
    return Math.round((completedStages / totalStages) * 100);
  };

  const handleExportCase = async () => {
    if (!caseItem) return;
    try {
      const stages = caseItem.stages.map(stage => ({
        title: stage.stage,
        content: stage.output
      }));
      
      await exportResultsToPDF(stages, { caseName: caseItem.name });
    } catch (error) {
      console.error('Error exporting case:', error);
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

  // دالة التحليل التلقائي المحسن لجميع المراحل
  const startAutoAnalysis = async () => {
    if (!caseItem || isAutoAnalyzing) return;

    // التحقق من وجود API key في Local Storage
    let apiKey = '';
    try {
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (!savedApiKey) {
        setAnalysisError('يرجى إعداد مفتاح Gemini API من الإعدادات أولاً');
        return;
      }
      apiKey = savedApiKey;
    } catch (error) {
      setAnalysisError('خطأ في الوصول لمفتاح API');
      return;
    }

    setAnalysisError('');
    setShowSequentialProgress(true);
    setSequentialAnalysisResults([]);
    setCanPauseResume(true);

    try {
      // قائمة المراحل الـ 12
      const stages = [
        'تحليل الوقائع الأساسية',
        'تحديد الأطراف القانونية',
        'تحليل النزاع القانوني',
        'البحث عن القوانين المنطبقة',
        'تحليل السوابق القضائية',
        'تحديد الأدلة القانونية',
        'تحليل القوة القانونية',
        'تحديد نقاط الضعف',
        'صياغة الاستراتيجية القانونية',
        'تحليل المخاطر القانونية',
        'إعداد خطة المرافعة',
        'تقييم احتمالية النجاح'
      ];

      // إنشاء مدير التحليل المتسلسل
      const manager = createSequentialAnalysisManager(
        stages,
        {
          baseDelay: 5000, // 5 ثواني كحد أدنى
          maxDelay: 15000, // 15 ثانية كحد أقصى
          maxRetries: 3,
          timeoutPerStage: 60000, // دقيقة لكل مرحلة
          enableProgressSave: true
        },
        // Progress callback
        (progress: AnalysisProgress) => {
          setSequentialProgress(progress);
          setCurrentAnalyzingStage(progress.currentStage);
          setAnalysisProgress(progress.progress);
          
          // تنسيق الوقت المتبقي
          if (progress.estimatedTimeRemaining) {
            const minutes = Math.floor(progress.estimatedTimeRemaining / 60000);
            const seconds = Math.floor((progress.estimatedTimeRemaining % 60000) / 1000);
            setEstimatedTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          }

          setIsAutoAnalyzing(progress.isRunning);
          
          if (progress.lastError) {
            setAnalysisError(progress.lastError);
          }
        },
        // Stage complete callback
        (stage: SequentialAnalysisStage) => {
          setSequentialAnalysisResults(prev => [...prev, stage]);
          
          // تحويل للنظام القديم للتوافق
          const convertedStage: AnalysisStage = {
            id: stage.id,
            stageIndex: stage.stageIndex,
            stage: stage.stage,
            input: stage.input,
            output: stage.output,
            date: stage.date
          };
          
          setAnalysisResults(prev => [...prev, convertedStage]);
        }
      );

      setSequentialAnalysisManager(manager);

      // بدء التحليل
      const analysisInput = caseItem.stages?.[0]?.input || caseItem.name || 'تحليل القضية';
      const result = await manager.startAnalysis(
        analysisInput,
        apiKey,
        {
          caseId: caseItem.id
        }
      );

      console.log('نتيجة التحليل المتسلسل:', result);

      // حفظ النتائج في القضية
      if (result.results.length > 0) {
        const convertedResults = result.results.map((seqStage: SequentialAnalysisStage): AnalysisStage => ({
          id: seqStage.id,
          stageIndex: seqStage.stageIndex,
          stage: seqStage.stage,
          input: seqStage.input,
          output: seqStage.output,
          date: seqStage.date
        }));

        const updatedCase = {
          ...caseItem,
          stages: [...(caseItem.stages || []), ...convertedResults]
        };
        
        await updateCase(updatedCase);
        setCaseItem(updatedCase);
      }

      if (!result.success && result.errors.length > 0) {
        setAnalysisError(`فشل في ${result.errors.length} مرحلة من أصل ${stages.length}`);
      }

    } catch (error) {
      console.error('خطأ في التحليل التلقائي المحسن:', error);
      setAnalysisError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsAutoAnalyzing(false);
      setCanPauseResume(false);
      setShowSequentialProgress(false);
    }
  };

  // دالة إيقاف التحليل المحسن
  const stopAutoAnalysis = () => {
    if (sequentialAnalysisManager) {
      sequentialAnalysisManager.stop();
    }
    setIsAutoAnalyzing(false);
    setCurrentAnalyzingStage(0);
    setAnalysisProgress(0);
    setCanPauseResume(false);
    setShowSequentialProgress(false);
  };

  // دالة إيقاف/استئناف مؤقت
  const togglePauseResume = () => {
    if (sequentialAnalysisManager) {
      if (sequentialProgress?.isPaused) {
        sequentialAnalysisManager.resume();
      } else {
        sequentialAnalysisManager.pause();
      }
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
          جاري تحميل القضية...
        </div>
      </div>
    );
  }

  if (!caseItem) {
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
          القضية غير موجودة
        </div>
      </div>
    );
  }

  const currentCase = editing ? editedCase : caseItem;

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <Link href="/cases">
                  <button style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: theme.accent2,
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    ← العودة للقضايا
                  </button>
                </Link>
                <h1 style={{
                  color: theme.text,
                  margin: '0',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {currentCase?.name}
                </h1>
              </div>
              <p style={{
                color: theme.text,
                margin: '0',
                opacity: 0.8
              }}>
                {currentCase?.clientName && `العميل: ${currentCase.clientName}`}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              {!editing && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: theme.accent,
                      color: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    onClick={handleExportCase}
                    style={{
                      padding: '8px 16px',
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
                </>
              )}
              {editing && (
                <>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    💾 حفظ
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#6b7280',
                      color: '#fff',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    ❌ إلغاء
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status and Priority */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#fff',
              background: getStatusColor(currentCase?.status || 'active')
            }}>
              {currentCase?.status === 'active' ? 'نشطة' : 
               currentCase?.status === 'completed' ? 'مكتملة' : 'مؤرشفة'}
            </span>
            <span style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#fff',
              background: getPriorityColor(currentCase?.priority || 'medium')
            }}>
              {currentCase?.priority === 'high' ? 'أولوية عالية' : 
               currentCase?.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          background: theme.card,
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          border: `1px solid ${theme.border}`,
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${theme.border}`
          }}>
            {[
              { key: 'overview', label: 'نظرة عامة', icon: '📊' },
              { key: 'stages', label: 'المراحل', icon: '📋' },
              { key: 'documents', label: 'المستندات', icon: '📄' },
              { key: 'notes', label: 'الملاحظات', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === tab.key ? theme.accent : theme.text,
                  fontSize: '14px',
                  fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.key ? `2px solid ${theme.accent}` : 'none'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'overview' && (
              <div>
                <h2 style={{
                  color: theme.text,
                  margin: '0 0 20px 0',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  معلومات القضية
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: theme.resultBg,
                    padding: '16px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <h3 style={{
                      color: theme.text,
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      التفاصيل الأساسية
                    </h3>
                    <div style={{ color: theme.text }}>
                      <p style={{ margin: '8px 0' }}>
                        <strong>نوع القضية:</strong> {currentCase?.caseType}
                      </p>
                      <p style={{ margin: '8px 0' }}>
                        <strong>تاريخ الإنشاء:</strong> {new Date(currentCase?.createdAt || '').toLocaleDateString('ar-EG')}
                      </p>
                      <p style={{ margin: '8px 0' }}>
                        <strong>العميل:</strong> {currentCase?.clientName || 'غير محدد'}
                      </p>
                      <p style={{ margin: '8px 0' }}>
                        <strong>المحكمة:</strong> {currentCase?.courtName || 'غير محدد'}
                      </p>
                      {currentCase?.nextHearing && (
                        <p style={{ margin: '8px 0' }}>
                          <strong>الجلسة القادمة:</strong> {new Date(currentCase.nextHearing).toLocaleDateString('ar-EG')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{
                    background: theme.resultBg,
                    padding: '16px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <h3 style={{
                      color: theme.text,
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      التقدم
                    </h3>
                    <div style={{ color: theme.text }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span>التقدم العام</span>
                        <span>{getCompletionPercentage(currentCase?.stages || [])}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: theme.border,
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: `${getCompletionPercentage(currentCase?.stages || [])}%`,
                          height: '100%',
                          background: theme.accent,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <p style={{ margin: '8px 0' }}>
                        <strong>المراحل المكتملة:</strong> {currentCase?.stages.length} من 12
                      </p>
                      <p style={{ margin: '8px 0' }}>
                        <strong>آخر تحديث:</strong> {currentCase?.stages && currentCase.stages.length > 0 
                          ? new Date(currentCase.stages[currentCase.stages.length - 1].date).toLocaleDateString('ar-EG')
                          : 'لا يوجد'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {currentCase?.tags && currentCase.tags.length > 0 && (
                  <div style={{
                    background: theme.resultBg,
                    padding: '16px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '24px'
                  }}>
                    <h3 style={{
                      color: theme.text,
                      margin: '0 0 12px 0',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      الوسوم
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {currentCase.tags.map((tag, index) => (
                        <span key={index} style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '14px',
                          background: theme.accent2,
                          color: '#fff'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stages' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <h2 style={{
                    color: theme.text,
                    margin: '0',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    مراحل التحليل
                  </h2>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {!isAutoAnalyzing ? (
                      <button
                        onClick={startAutoAnalysis}
                        disabled={!caseItem}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          background: caseItem ? '#10b981' : '#9ca3af',
                          color: '#fff',
                          fontSize: '14px',
                          cursor: caseItem ? 'pointer' : 'not-allowed',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        🚀 تحليل تلقائي لجميع المراحل
                      </button>
                    ) : (
                      <button
                        onClick={stopAutoAnalysis}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        ⏹️ إيقاف التحليل
                      </button>
                    )}
                  </div>
                </div>

                {/* مؤشر التقدم */}
                {isAutoAnalyzing && (
                  <div style={{
                    background: theme.resultBg,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `2px solid ${theme.accent}`,
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #10b981',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <h3 style={{
                        color: theme.text,
                        margin: '0',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        جاري التحليل التلقائي...
                      </h3>
                    </div>
                    
                    <div style={{
                      background: '#e5e7eb',
                      height: '12px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: `${analysisProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        transition: 'width 0.5s ease',
                        borderRadius: '6px'
                      }} />
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: theme.text
                    }}>
                      <span>المرحلة {currentAnalyzingStage + 1} من 12</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    
                    {analysisResults.length > 0 && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: theme.card,
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          color: theme.text,
                          fontWeight: 'bold'
                        }}>
                          المراحل المكتملة:
                        </p>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px'
                        }}>
                          {analysisResults.map((result, index) => (
                            <span key={index} style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              background: '#10b981',
                              color: '#fff',
                              fontWeight: 'bold'
                            }}>
                              ✓ {result.stage}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* رسالة الخطأ */}
                {analysisError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>❌</span>
                      <strong>خطأ في التحليل التلقائي:</strong>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                      {analysisError}
                    </p>
                  </div>
                )}
                
                {currentCase?.stages && currentCase.stages.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {currentCase.stages.map((stage, index) => (
                      <div key={stage.id} style={{
                        background: theme.resultBg,
                        padding: '20px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <h3 style={{
                            color: theme.text,
                            margin: '0',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}>
                            {stage.stage}
                          </h3>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: theme.accent,
                            color: '#fff'
                          }}>
                            المرحلة {stage.stageIndex + 1}
                          </span>
                        </div>
                        
                        <div style={{
                          color: theme.text,
                          marginBottom: '12px'
                        }}>
                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            opacity: 0.8
                          }}>
                            <strong>التاريخ:</strong> {new Date(stage.date).toLocaleDateString('ar-EG')}
                          </p>
                        </div>

                        <div style={{
                          background: theme.card,
                          padding: '12px',
                          borderRadius: '6px',
                          border: `1px solid ${theme.border}`,
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          <div style={{
                            color: theme.text,
                            fontSize: '14px',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {stage.output}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: theme.text,
                    opacity: 0.7
                  }}>
                    لا توجد مراحل مكتملة بعد
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{
                    color: theme.text,
                    margin: '0',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    📁 المستندات والملفات ({documents.length})
                  </h2>
                  <Link href="/documents">
                    <button style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: theme.accent,
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}>
                      📤 إدارة المستندات
                    </button>
                  </Link>
                </div>

                {documents.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '16px'
                  }}>
                    {documents.map((document) => (
                      <div key={document.id} style={{
                        background: theme.card,
                        padding: '16px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ fontSize: '20px' }}>
                            {getFileIcon(document.type)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              color: theme.text,
                              margin: '0 0 4px 0',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              wordBreak: 'break-word'
                            }}>
                              {document.name}
                            </h4>
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
                          gap: '4px',
                          marginBottom: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#fff',
                            background: getCategoryColor(document.category)
                          }}>
                            {getCategoryLabel(document.category)}
                          </span>
                        </div>

                        <p style={{
                          color: theme.text,
                          margin: '0 0 8px 0',
                          fontSize: '11px',
                          opacity: 0.6
                        }}>
                          رفع: {new Date(document.uploadedAt).toLocaleDateString('ar-EG')}
                        </p>

                        <div style={{
                          display: 'flex',
                          gap: '4px',
                          justifyContent: 'flex-end'
                        }}>
                          <button
                            onClick={() => {
                              // TODO: Implement document preview
                              alert('معاينة المستند قيد التطوير');
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              background: theme.accent2,
                              color: '#fff',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implement document download
                              alert('تحميل المستند قيد التطوير');
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              background: theme.accent,
                              color: '#fff',
                              fontSize: '10px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            ⬇️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: theme.text,
                    opacity: 0.7
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                      📁
                    </div>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '18px'
                    }}>
                      لا توجد مستندات
                    </h3>
                    <p style={{
                      margin: '0 0 16px 0',
                      fontSize: '14px'
                    }}>
                      ابدأ برفع المستندات المتعلقة بهذه القضية
                    </p>
                    <Link href="/documents">
                      <button style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: theme.accent,
                        color: '#fff',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}>
                        📤 رفع مستندات
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h2 style={{
                  color: theme.text,
                  margin: '0 0 20px 0',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  الملاحظات
                </h2>
                
                {editing ? (
                  <textarea
                    value={currentCase?.notes || ''}
                    onChange={(e) => setEditedCase(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    placeholder="أضف ملاحظاتك هنا..."
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: theme.card,
                      color: theme.text,
                      fontSize: '14px',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <div style={{
                    background: theme.resultBg,
                    padding: '20px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                    minHeight: '200px'
                  }}>
                    {currentCase?.notes ? (
                      <div style={{
                        color: theme.text,
                        fontSize: '14px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {currentCase.notes}
                      </div>
                    ) : (
                      <div style={{
                        color: theme.text,
                        opacity: 0.7,
                        textAlign: 'center',
                        padding: '40px'
                      }}>
                        لا توجد ملاحظات
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
