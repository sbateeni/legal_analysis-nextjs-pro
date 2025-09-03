import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AddCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: (comment: any) => void;
  caseId: string;
  caseName: string;
  stageId?: string;
  documentId?: string;
}

interface CommentData {
  content: string;
  type: 'comment' | 'suggestion' | 'question' | 'approval';
  priority: 'low' | 'medium' | 'high';
  isPrivate: boolean;
}

export default function AddCommentModal({ 
  isOpen, 
  onClose, 
  onCommentAdded, 
  caseId, 
  caseName,
  stageId,
  documentId 
}: AddCommentModalProps) {
  const { theme } = useTheme();
  const [commentData, setCommentData] = useState<CommentData>({
    content: '',
    type: 'comment',
    priority: 'medium',
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // محاكاة إضافة التعليق
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newComment = {
        id: `comment-${Date.now()}`,
        caseId,
        authorId: 'current-user',
        authorName: 'أحمد محمد', // سيتم جلبها من النظام
        content: commentData.content,
        type: commentData.type,
        priority: commentData.priority,
        isPrivate: commentData.isPrivate,
        stageId,
        documentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isResolved: false
      };

      onCommentAdded(newComment);
      onClose();
      
      // إعادة تعيين النموذج
      setCommentData({
        content: '',
        type: 'comment',
        priority: 'medium',
        isPrivate: false
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'comment': return 'تعليق عام';
      case 'suggestion': return 'اقتراح تحسين';
      case 'question': return 'سؤال أو استفسار';
      case 'approval': return 'موافقة أو تأكيد';
      default: return 'تعليق';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'suggestion': return '💡';
      case 'question': return '❓';
      case 'approval': return '✅';
      default: return '💬';
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'متوسط';
    }
  };

  if (!isOpen) return null;

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
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: `0 4px 20px ${theme.shadow}`,
        border: `1px solid ${theme.border}`
      }}>
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
            💬 إضافة تعليق جديد
          </h2>
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

        {/* Case Info */}
        <div style={{
          background: theme.resultBg,
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `1px solid ${theme.border}`
        }}>
          <p style={{
            color: theme.text,
            margin: '0',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            القضية: {caseName}
          </p>
          {stageId && (
            <p style={{
              color: theme.text,
              margin: '4px 0 0 0',
              fontSize: '12px',
              opacity: 0.7
            }}>
              المرحلة: {stageId}
            </p>
          )}
          {documentId && (
            <p style={{
              color: theme.text,
              margin: '4px 0 0 0',
              fontSize: '12px',
              opacity: 0.7
            }}>
              المستند: {documentId}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Comment Type */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                نوع التعليق *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '8px'
              }}>
                {[
                  { value: 'comment', label: 'تعليق عام', icon: '💬' },
                  { value: 'suggestion', label: 'اقتراح', icon: '💡' },
                  { value: 'question', label: 'سؤال', icon: '❓' },
                  { value: 'approval', label: 'موافقة', icon: '✅' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setCommentData(prev => ({ ...prev, type: type.value as any }))}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${commentData.type === type.value ? theme.accent : theme.border}`,
                      background: commentData.type === type.value ? theme.accent : 'transparent',
                      color: commentData.type === type.value ? '#fff' : theme.text,
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                الأولوية
              </label>
              <select
                value={commentData.priority}
                onChange={(e) => setCommentData(prev => ({ ...prev, priority: e.target.value as any }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  background: theme.card,
                  color: theme.text,
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                محتوى التعليق *
              </label>
              <textarea
                value={commentData.content}
                onChange={(e) => setCommentData(prev => ({ ...prev, content: e.target.value }))}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  background: theme.card,
                  color: theme.text,
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="اكتب تعليقك هنا..."
              />
            </div>

            {/* Privacy */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="checkbox"
                id="isPrivate"
                checked={commentData.isPrivate}
                onChange={(e) => setCommentData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                style={{
                  width: '16px',
                  height: '16px'
                }}
              />
              <label htmlFor="isPrivate" style={{
                color: theme.text,
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                تعليق خاص (مرئي للمدير فقط)
              </label>
            </div>

            {/* Preview */}
            <div style={{
              background: theme.resultBg,
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                color: theme.text,
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                معاينة التعليق:
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {getTypeIcon(commentData.type)}
                </span>
                <span style={{
                  color: theme.text,
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {getTypeLabel(commentData.type)}
                </span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#fff',
                  background: getPriorityColor(commentData.priority)
                }}>
                  {getPriorityLabel(commentData.priority)}
                </span>
                {commentData.isPrivate && (
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: '#6b7280'
                  }}>
                    خاص
                  </span>
                )}
              </div>
              <p style={{
                color: theme.text,
                margin: '0',
                fontSize: '12px',
                opacity: 0.8,
                fontStyle: 'italic'
              }}>
                {commentData.content || 'محتوى التعليق سيظهر هنا...'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '24px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: 'transparent',
                color: theme.text,
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !commentData.content.trim()}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: loading || !commentData.content.trim() ? theme.border : theme.accent,
                color: '#fff',
                fontSize: '14px',
                cursor: loading || !commentData.content.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: loading || !commentData.content.trim() ? 0.7 : 1
              }}
            >
              {loading ? 'جاري الإضافة...' : 'إضافة التعليق'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
