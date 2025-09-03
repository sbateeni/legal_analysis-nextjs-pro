import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: (invite: any) => void;
}

interface InviteData {
  email: string;
  role: 'viewer' | 'editor' | 'reviewer';
  caseId: string;
  caseName: string;
  message: string;
}

export default function InviteMemberModal({ isOpen, onClose, onInviteSent }: InviteMemberModalProps) {
  const { theme } = useTheme();
  const [inviteData, setInviteData] = useState<InviteData>({
    email: '',
    role: 'viewer',
    caseId: '',
    caseName: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // محاكاة إرسال الدعوة
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newInvite = {
        id: `invite-${Date.now()}`,
        ...inviteData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      onInviteSent(newInvite);
      onClose();
      
      // إعادة تعيين النموذج
      setInviteData({
        email: '',
        role: 'viewer',
        caseId: '',
        caseName: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'viewer': return 'مشاهد - يمكنه عرض القضية فقط';
      case 'editor': return 'محرر - يمكنه تعديل القضية';
      case 'reviewer': return 'مراجع - يمكنه مراجعة وإضافة تعليقات';
      default: return 'مشاهد';
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
        maxWidth: '500px',
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
            📧 دعوة عضو جديد
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

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                required
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
                placeholder="example@lawfirm.com"
              />
            </div>

            {/* Role */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                الدور *
              </label>
              <select
                value={inviteData.role}
                onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value as any }))}
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
                <option value="viewer">مشاهد</option>
                <option value="editor">محرر</option>
                <option value="reviewer">مراجع</option>
              </select>
              <p style={{
                color: theme.text,
                margin: '4px 0 0 0',
                fontSize: '12px',
                opacity: 0.7
              }}>
                {getRoleLabel(inviteData.role)}
              </p>
            </div>

            {/* Case Selection */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                القضية (اختياري)
              </label>
              <input
                type="text"
                value={inviteData.caseName}
                onChange={(e) => setInviteData(prev => ({ ...prev, caseName: e.target.value }))}
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
                placeholder="اسم القضية أو اتركه فارغاً للوصول العام"
              />
            </div>

            {/* Message */}
            <div>
              <label style={{
                display: 'block',
                color: theme.text,
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                رسالة شخصية (اختياري)
              </label>
              <textarea
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
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
                placeholder="أضف رسالة ترحيبية أو تعليمات خاصة..."
              />
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
                معاينة الدعوة:
              </h4>
              <p style={{
                color: theme.text,
                margin: '0 0 4px 0',
                fontSize: '12px',
                opacity: '0.8'
              }}>
                إلى: {inviteData.email || 'البريد الإلكتروني'}
              </p>
              <p style={{
                color: theme.text,
                margin: '0 0 4px 0',
                fontSize: '12px',
                opacity: '0.8'
              }}>
                الدور: {getRoleLabel(inviteData.role)}
              </p>
              {inviteData.caseName && (
                <p style={{
                  color: theme.text,
                  margin: '0 0 4px 0',
                  fontSize: '12px',
                  opacity: '0.8'
                }}>
                  القضية: {inviteData.caseName}
                </p>
              )}
              {inviteData.message && (
                <p style={{
                  color: theme.text,
                  margin: '0',
                  fontSize: '12px',
                  opacity: '0.8'
                }}>
                  الرسالة: {inviteData.message}
                </p>
              )}
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
              disabled={loading || !inviteData.email}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: loading || !inviteData.email ? theme.border : theme.accent,
                color: '#fff',
                fontSize: '14px',
                cursor: loading || !inviteData.email ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: loading || !inviteData.email ? 0.7 : 1
              }}
            >
              {loading ? 'جاري الإرسال...' : 'إرسال الدعوة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
