/**
 * مكون الإعدادات المبسطة - يحتوي على الأساسيات فقط
 * Simplified Settings Component - Essential Settings Only
 */

import React from 'react';
import Link from 'next/link';

interface AdvancedSettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  preferredModel: string;
  setPreferredModel: (model: string) => void;
  theme: any;
  isMobile: boolean;
  darkMode: boolean;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  apiKey,
  setApiKey,
  preferredModel,
  setPreferredModel,
  theme,
  isMobile,
  darkMode
}) => {
  return (
    <div style={{
      background: theme.card,
      borderRadius: 16,
      padding: isMobile ? 16 : 24,
      marginBottom: 20,
      border: `1.5px solid ${theme.border}`,
      boxShadow: `0 4px 20px ${theme.shadow}`,
    }}>
      {/* العنوان مع رابط الإعدادات الكاملة */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
      }}>
        <h2 style={{
          color: theme.accent,
          fontSize: isMobile ? 18 : 20,
          fontWeight: 'bold',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          ⚙️ الإعدادات الأساسية
        </h2>
        
        <Link href="/settings" style={{
          background: `${theme.accent}20`,
          color: theme.accent,
          padding: '8px 16px',
          borderRadius: 8,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 'bold',
          border: `1px solid ${theme.accent}40`,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span>🔧</span>
          <span style={{ display: isMobile ? 'none' : 'inline' }}>إعدادات متقدمة</span>
        </Link>
      </div>

      {/* مفتاح API - الأساسي */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 8,
          color: theme.text,
        }}>
          🔑 مفتاح Gemini API:
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              width: '100%',
              borderRadius: 8,
              border: `2px solid ${apiKey ? '#10b981' : theme.input}`,
              padding: 12,
              fontSize: 16,
              outline: 'none',
              background: darkMode ? '#1a1d29' : '#fff',
              color: theme.text,
              transition: 'all 0.3s ease',
              fontFamily: 'Tajawal, Arial, sans-serif',
              paddingRight: 40
            }}
            placeholder="أدخل مفتاح Gemini API..."
          />
          {apiKey && (
            <div style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#10b981',
              fontSize: 16
            }}>
              ✓
            </div>
          )}
        </div>
        {!apiKey && (
          <div style={{
            marginTop: 8,
            padding: 8,
            background: '#fef3c7',
            borderRadius: 6,
            fontSize: 12,
            color: '#92400e'
          }}>
            💡 <strong>مطلوب:</strong> احصل على مفتاح مجاني من{' '}
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: theme.accent, fontWeight: 'bold' }}>
              Google AI Studio
            </a>
          </div>
        )}
      </div>

      {/* اختيار النموذج - مبسط */}
      <div>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 8,
          color: theme.text,
        }}>
          🤖 النموذج المفضل:
        </label>
        <select
          value={preferredModel}
          onChange={(e) => setPreferredModel(e.target.value)}
          style={{
            width: '100%',
            borderRadius: 8,
            border: `2px solid ${theme.input}`,
            padding: 12,
            fontSize: 16,
            outline: 'none',
            background: darkMode ? '#1a1d29' : '#fff',
            color: theme.text,
            fontFamily: 'Tajawal, Arial, sans-serif',
          }}
        >
          <option value="gemini-1.5-flash">Gemini 1.5 Flash (موصى به - سريع)</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro (دقيق للقضايا المعقدة)</option>
          <option value="gemini-pro">Gemini Pro (متوازن)</option>
        </select>
      </div>

      {/* معلومات مساعدة مبسطة */}
      <div style={{
        marginTop: 16,
        padding: 12,
        background: `${theme.accent}10`,
        borderRadius: 8,
        fontSize: 13,
        color: theme.text,
        opacity: 0.9
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
          <div>
            <span style={{ fontWeight: 'bold', color: theme.accent }}>⚡ Flash:</span> سريع ومناسب للاستخدام العام
          </div>
          <div>
            <span style={{ fontWeight: 'bold', color: theme.accent }}>🎯 Pro:</span> أكثر دقة للقضايا المعقدة
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          💡 للمزيد من الإعدادات (الألوان، المظهر، النسخ الاحتياطي، إلخ) اضغط على "إعدادات متقدمة" أعلاه
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;