/**
 * مكون إشعار التقدم المحفوظ
 * Saved Progress Notification Component
 */

import React from 'react';

interface SavedProgressNotificationProps {
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  hasProgress: boolean;
  onLoadProgress: () => void;
  theme: any;
  isMobile: boolean;
}

export const SavedProgressNotification: React.FC<SavedProgressNotificationProps> = ({
  completedCount,
  totalCount,
  progressPercentage,
  hasProgress,
  onLoadProgress,
  theme,
  isMobile
}) => {
  if (!hasProgress) return null;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.accent}15 0%, ${theme.accent2}15 100%)`,
      borderRadius: 12,
      padding: isMobile ? 12 : 16,
      marginBottom: 16,
      border: `1px solid ${theme.accent}30`,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      {/* أيقونة التقدم */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
      }}>
        📄
      </div>
      
      {/* معلومات التقدم */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 'bold',
          color: theme.text,
          fontSize: isMobile ? 14 : 16,
          marginBottom: 4
        }}>
          تم العثور على تقدم محفوظ
        </div>
        <div style={{
          color: theme.text,
          opacity: 0.8,
          fontSize: isMobile ? 12 : 14
        }}>
          {completedCount} من {totalCount} مراحل مكتملة ({progressPercentage}%)
        </div>
      </div>
      
      {/* زر إعادة التحميل */}
      <button
        onClick={onLoadProgress}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: 'none',
          background: theme.accent,
          color: '#fff',
          fontSize: isMobile ? 12 : 14,
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.accent2;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.accent;
        }}
      >
        🔄 تحديث
      </button>
    </div>
  );
};

export default SavedProgressNotification;