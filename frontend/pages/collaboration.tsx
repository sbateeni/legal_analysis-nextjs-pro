import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, getAllTeamMembers, getAllInvites, getAllComments, getAllReviews } from '@utils/db';

import InviteMemberModal from '../components/InviteMemberModal';
import AddCommentModal from '../components/AddCommentModal';

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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lawyer' | 'assistant' | 'reviewer';
  avatar?: string;
  isOnline: boolean;
  lastActive: string;
}

interface CollaborationInvite {
  id: string;
  caseId: string;
  caseName: string;
  invitedBy: string;
  invitedTo: string;
  role: 'viewer' | 'editor' | 'reviewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

interface CaseComment {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  type: 'comment' | 'suggestion' | 'question' | 'approval';
  stageId?: string;
  documentId?: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  replies?: CaseComment[];
}

interface CaseReview {
  id: string;
  caseId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_revision';
  feedback: string;
  suggestions: string[];
  rating: number;
  createdAt: string;
  completedAt?: string;
}

interface CollaborationData {
  teamMembers: TeamMember[];
  invites: CollaborationInvite[];
  comments: CaseComment[];
  reviews: CaseReview[];
  sharedCases: LegalCase[];
}

export default function CollaborationPage() {
  return <CollaborationPageContent />;
}

function CollaborationPageContent() {
  const { theme } = useTheme();
  const [collaborationData, setCollaborationData] = useState<CollaborationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'team' | 'invites' | 'comments' | 'reviews'>('team');
  const [selectedCase] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    loadCollaborationData();
  }, [selectedCase]);

  const handleInviteSent = (invite: any) => {
    if (collaborationData) {
      setCollaborationData(prev => ({
        ...prev!,
        invites: [...prev!.invites, invite]
      }));
    }
  };

  const handleCommentAdded = (comment: any) => {
    if (collaborationData) {
      setCollaborationData(prev => ({
        ...prev!,
        comments: [...prev!.comments, comment]
      }));
    }
  };

  const loadCollaborationData = async () => {
    try {
      const [cases, teamMembers, invites, comments, reviews] = await Promise.all([
        getAllCases(),
        getAllTeamMembers(),
        getAllInvites(),
        getAllComments(),
        getAllReviews()
      ]);

      const formattedCases: LegalCase[] = cases.map((c: any) => ({
        ...c,
        status: c.status || 'active',
        priority: c.priority || 'medium',
        caseType: c.caseType || 'غير محدد',
        clientName: c.clientName || '',
        courtName: c.courtName || '',
        nextHearing: c.nextHearing || '',
        notes: c.notes || '',
      }));

      // استخدام البيانات الحقيقية مع إضافة بيانات تجريبية إذا لم تكن موجودة
      const collaborationData: CollaborationData = {
        teamMembers: teamMembers.length > 0 ? teamMembers : generateMockTeamMembers(),
        invites: invites.length > 0 ? invites : generateMockInvites(formattedCases),
        comments: comments.length > 0 ? comments : generateMockComments(formattedCases),
        reviews: reviews.length > 0 ? reviews : generateMockReviews(formattedCases),
        sharedCases: formattedCases.slice(0, 3)
      };
      setCollaborationData(collaborationData);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTeamMembers = (): TeamMember[] => [
    {
      id: 'user-1',
      name: 'أحمد محمد',
      email: 'ahmed@lawfirm.com',
      role: 'admin',
      isOnline: true,
      lastActive: new Date().toISOString()
    },
    {
      id: 'user-2',
      name: 'فاطمة علي',
      email: 'fatima@lawfirm.com',
      role: 'lawyer',
      isOnline: true,
      lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 'user-3',
      name: 'محمد حسن',
      email: 'mohammed@lawfirm.com',
      role: 'reviewer',
      isOnline: false,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'user-4',
      name: 'سارة أحمد',
      email: 'sara@lawfirm.com',
      role: 'assistant',
      isOnline: true,
      lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    }
  ];

  const generateMockInvites = (cases: LegalCase[]): CollaborationInvite[] => [
    {
      id: 'invite-1',
      caseId: cases[0]?.id || 'case-1',
      caseName: cases[0]?.name || 'قضية تجارية',
      invitedBy: 'أحمد محمد',
      invitedTo: 'lawyer@external.com',
      role: 'reviewer',
      status: 'pending',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const generateMockComments = (cases: LegalCase[]): CaseComment[] => [
    {
      id: 'comment-1',
      caseId: cases[0]?.id || 'case-1',
      authorId: 'user-2',
      authorName: 'فاطمة علي',
      content: 'هذا التحليل ممتاز، لكن أحتاج مراجعة النقطة الثالثة',
      type: 'comment',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isResolved: false
    },
    {
      id: 'comment-2',
      caseId: cases[0]?.id || 'case-1',
      authorId: 'user-3',
      authorName: 'محمد حسن',
      content: 'أقترح إضافة مرجع قانوني إضافي هنا',
      type: 'suggestion',
      stageId: cases[0]?.stages[0]?.id,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isResolved: true
    }
  ];

  const generateMockReviews = (cases: LegalCase[]): CaseReview[] => [
    {
      id: 'review-1',
      caseId: cases[0]?.id || 'case-1',
      reviewerId: 'user-3',
      reviewerName: 'محمد حسن',
      status: 'completed',
      feedback: 'التحليل شامل ومفصل، جاهز للمرافعة',
      suggestions: ['إضافة مرجع قانوني إضافي', 'توضيح النقطة الخامسة'],
      rating: 4.5,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'lawyer': return 'محامي';
      case 'assistant': return 'مساعد';
      case 'reviewer': return 'مراجع';
      default: return 'عضو';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'lawyer': return '#3b82f6';
      case 'assistant': return '#10b981';
      case 'reviewer': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'declined': return '#ef4444';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'needs_revision': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'accepted': return 'مقبول';
      case 'declined': return 'مرفوض';
      case 'in_progress': return 'قيد المراجعة';
      case 'completed': return 'مكتمل';
      case 'needs_revision': return 'يحتاج مراجعة';
      default: return 'غير محدد';
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'suggestion': return '💡';
      case 'question': return '❓';
      case 'approval': return '✅';
      default: return '💬';
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
          جاري تحميل بيانات التعاون...
        </div>
      </div>
    );
  }

  if (!collaborationData) {
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
          حدث خطأ في تحميل البيانات
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
        maxWidth: '1400px',
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
            marginBottom: '20px'
          }}>
            <h1 style={{
              color: theme.text,
              margin: '0',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              🤝 التعاون والمراجعة
            </h1>
            <button 
              onClick={() => setShowInviteModal(true)}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
              + دعوة عضو جديد
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            {[
              { id: 'team', label: 'فريق العمل', count: collaborationData.teamMembers.length },
              { id: 'invites', label: 'الدعوات', count: collaborationData.invites.length },
              { id: 'comments', label: 'التعليقات', count: collaborationData.comments.length },
              { id: 'reviews', label: 'المراجعات', count: collaborationData.reviews.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  background: activeTab === tab.id ? theme.accent : 'transparent',
                  color: activeTab === tab.id ? '#fff' : theme.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {tab.label}
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : theme.accent,
                  color: activeTab === tab.id ? '#fff' : '#fff',
                  fontSize: '12px'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: theme.card,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          border: `1px solid ${theme.border}`
        }}>
          {activeTab === 'team' && (
            <div>
              <h2 style={{
                color: theme.text,
                margin: '0 0 20px 0',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                👥 فريق العمل
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {collaborationData.teamMembers.map((member) => (
                  <div key={member.id} style={{
                    background: theme.resultBg,
                    padding: '20px',
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
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: theme.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        {member.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          color: theme.text,
                          margin: '0 0 4px 0',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          {member.name}
                        </h3>
                        <p style={{
                          color: theme.text,
                          margin: '0',
                          fontSize: '14px',
                          opacity: 0.7
                        }}>
                          {member.email}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: member.isOnline ? '#10b981' : '#6b7280'
                        }} />
                        <span style={{
                          color: theme.text,
                          fontSize: '12px',
                          opacity: 0.7
                        }}>
                          {member.isOnline ? 'متصل' : 'غير متصل'}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#fff',
                        background: getRoleColor(member.role)
                      }}>
                        {getRoleLabel(member.role)}
                      </span>
                      <span style={{
                        color: theme.text,
                        fontSize: '12px',
                        opacity: 0.7
                      }}>
                        آخر نشاط: {new Date(member.lastActive).toLocaleDateString('ar-SA')}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: theme.accent2,
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}>
                        مراسلة
                      </button>
                      <button style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.border}`,
                        background: 'transparent',
                        color: theme.text,
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}>
                        عرض الملف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invites' && (
            <div>
              <h2 style={{
                color: theme.text,
                margin: '0 0 20px 0',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                📧 الدعوات
              </h2>

              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                {collaborationData.invites.map((invite) => (
                  <div key={invite.id} style={{
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
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          color: theme.text,
                          margin: '0 0 8px 0',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          دعوة للمشاركة في: {invite.caseName}
                        </h3>
                        <p style={{
                          color: theme.text,
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          opacity: 0.8
                        }}>
                          من: {invite.invitedBy} → إلى: {invite.invitedTo}
                        </p>
                        <p style={{
                          color: theme.text,
                          margin: '0',
                          fontSize: '14px',
                          opacity: 0.7
                        }}>
                          الدور: {invite.role === 'viewer' ? 'مشاهد' : 
                                  invite.role === 'editor' ? 'محرر' : 'مراجع'}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#fff',
                        background: getStatusColor(invite.status)
                      }}>
                        {getStatusLabel(invite.status)}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px'
                    }}>
                      <span style={{
                        color: theme.text,
                        fontSize: '12px',
                        opacity: 0.7
                      }}>
                        انتهاء الصلاحية: {new Date(invite.expiresAt).toLocaleDateString('ar-SA')}
                      </span>
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#10b981',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}>
                          قبول
                        </button>
                        <button style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}>
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
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
                  💬 التعليقات والملاحظات
                </h2>
                <button 
                  onClick={() => setShowCommentModal(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: theme.accent,
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                  + إضافة تعليق
                </button>
              </div>

              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                {collaborationData.comments.map((comment) => (
                  <div key={comment.id} style={{
                    background: theme.resultBg,
                    padding: '20px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        fontSize: '24px'
                      }}>
                        {getCommentTypeIcon(comment.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <h4 style={{
                            color: theme.text,
                            margin: '0',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {comment.authorName}
                          </h4>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#fff',
                            background: comment.isResolved ? '#10b981' : '#f59e0b'
                          }}>
                            {comment.isResolved ? 'محلول' : 'معلق'}
                          </span>
                        </div>
                        <p style={{
                          color: theme.text,
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}>
                          {comment.content}
                        </p>
                        <span style={{
                          color: theme.text,
                          fontSize: '12px',
                          opacity: 0.7
                        }}>
                          {new Date(comment.createdAt).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    {!comment.isResolved && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '12px'
                      }}>
                        <button style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          background: theme.accent,
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}>
                          رد
                        </button>
                        <button style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#10b981',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}>
                          حل
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 style={{
                color: theme.text,
                margin: '0 0 20px 0',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                📋 المراجعات
              </h2>

              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                {collaborationData.reviews.map((review) => (
                  <div key={review.id} style={{
                    background: theme.resultBg,
                    padding: '20px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                  }}>
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
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          مراجعة من: {review.reviewerName}
                        </h3>
                        <p style={{
                          color: theme.text,
                          margin: '0',
                          fontSize: '14px',
                          opacity: 0.8
                        }}>
                          {review.feedback}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '8px'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#fff',
                          background: getStatusColor(review.status)
                        }}>
                          {getStatusLabel(review.status)}
                        </span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{
                            color: theme.text,
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {review.rating}
                          </span>
                          <span style={{ color: '#f59e0b', fontSize: '16px' }}>⭐</span>
                        </div>
                      </div>
                    </div>

                    {review.suggestions.length > 0 && (
                      <div style={{
                        marginBottom: '16px'
                      }}>
                        <h4 style={{
                          color: theme.text,
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          الاقتراحات:
                        </h4>
                        <ul style={{
                          color: theme.text,
                          margin: '0',
                          padding: '0 0 0 20px',
                          fontSize: '14px',
                          opacity: 0.8
                        }}>
                          {review.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: theme.text,
                      opacity: 0.7
                    }}>
                      <span>
                        بدء: {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                      {review.completedAt && (
                        <span>
                          انتهاء: {new Date(review.completedAt).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={handleInviteSent}
      />

      <AddCommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onCommentAdded={handleCommentAdded}
        caseId="general"
        caseName="تعليق عام"
      />
    </div>
  );
}
