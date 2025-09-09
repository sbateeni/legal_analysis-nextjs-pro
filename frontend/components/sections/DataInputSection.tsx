/**
 * مكون إدخال البيانات الرئيسي
 * Main Data Input Component
 */

import React from 'react';

interface DataInputSectionProps {
  mainText: string;
  setMainText: (text: string) => void;
  caseNameInput: string;
  setCaseNameInput: (name: string) => void;
  partyRole: string;
  setPartyRole: (role: string) => void;
  theme: any;
  isMobile: boolean;
  darkMode: boolean;
  // إضافة دعم القضايا السابقة
  existingCases?: any[];
  onSelectExistingCase?: (caseId: string) => void;
}

export const DataInputSection: React.FC<DataInputSectionProps> = ({
  mainText,
  setMainText,
  caseNameInput,
  setCaseNameInput,
  partyRole,
  setPartyRole,
  theme,
  isMobile,
  darkMode,
  existingCases = [],
  onSelectExistingCase
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
      {/* العنوان */}
      <h2 style={{
        color: theme.accent,
        fontSize: isMobile ? 20 : 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}>
        ✍️ إدخال بيانات القضية
      </h2>

      {/* اختيار قضية سابقة للاستكمال */}
      {existingCases && existingCases.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 8,
            color: theme.text,
          }}>
            💼 استكمال قضية سابقة:
          </label>
          <select
            onChange={(e) => {
              if (e.target.value && onSelectExistingCase) {
                onSelectExistingCase(e.target.value);
              }
            }}
            style={{
              width: '100%',
              borderRadius: 8,
              border: `2px solid ${theme.input}`,
              padding: 12,
              fontSize: 14,
              outline: 'none',
              background: darkMode ? '#1a1d29' : '#fff',
              color: theme.text,
              fontFamily: 'Tajawal, Arial, sans-serif',
            }}
            defaultValue=""
          >
            <option value="">اختر قضية لاستكمال التحليل...</option>
            {existingCases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.name} ({caseItem.stages?.length || 0} مراحل مكتملة)
              </option>
            ))}
          </select>
          <div style={{
            marginTop: 6,
            fontSize: 12,
            color: theme.text,
            opacity: 0.7
          }}>
            💡 يمكنك استكمال تحليل قضية سابقة لم تكتمل بعد
          </div>
        </div>
      )}

      {/* حقل اسم القضية */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 8,
          color: theme.text,
        }}>
          📝 اسم القضية (اختياري):
        </label>
        <input
          type="text"
          value={caseNameInput}
          onChange={(e) => setCaseNameInput(e.target.value)}
          style={{
            width: '100%',
            borderRadius: 8,
            border: `2px solid ${theme.input}`,
            padding: 12,
            fontSize: 16,
            outline: 'none',
            background: darkMode ? '#1a1d29' : '#fff',
            color: theme.text,
            transition: 'all 0.3s ease',
            fontFamily: 'Tajawal, Arial, sans-serif',
          }}
          placeholder="مثال: قضية نزاع تجاري - شركة أ ضد شركة ب"
        />
      </div>

      {/* حقل صفة الطرف */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 8,
          color: theme.text,
        }}>
          ⚖️ صفتك في القضية:
        </label>
        <select
          value={partyRole}
          onChange={(e) => setPartyRole(e.target.value)}
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
          <option value="">اختر صفتك في القضية</option>
          <option value="المدعي">المدعي</option>
          <option value="المدعى عليه">المدعى عليه</option>
          <option value="المشتكي">المشتكي</option>
          <option value="المشتكى عليه">المشتكى عليه</option>
        </select>
        
        {/* إرشادات صفة الطرف */}
        <div style={{
          marginTop: 8,
          padding: 10,
          background: `${theme.accent}10`,
          borderRadius: 6,
          fontSize: 12,
          color: theme.text,
          lineHeight: 1.4
        }}>
          📝 <strong>ملاحظة مهمة:</strong>
          <ul style={{ margin: '4px 0 0 0', paddingRight: 16 }}>
            <li><strong>المدعي/المشتكي:</strong> الطرف الذي يرفع الدعوى ويطالب بحقوقه</li>
            <li><strong>المدعى عليه/المشتكى عليه:</strong> الطرف الذي ترفع ضده الدعوى</li>
            <li>هذا يؤثر على استراتيجية الدفاع والتحليل القانوني</li>
          </ul>
        </div>
      </div>

      {/* حقل تفاصيل القضية */}
      <div>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 8,
          color: theme.text,
        }}>
          📄 تفاصيل القضية:
        </label>
        <textarea
          value={mainText}
          onChange={(e) => setMainText(e.target.value)}
          rows={isMobile ? 6 : 8}
          style={{
            width: '100%',
            borderRadius: 12,
            border: `2px solid ${theme.input}`,
            padding: isMobile ? 12 : 16,
            fontSize: isMobile ? 16 : 18,
            marginBottom: 0,
            resize: 'vertical',
            outline: 'none',
            boxShadow: `0 2px 8px ${theme.shadow}`,
            background: darkMode ? '#181a2a' : '#fff',
            color: theme.text,
            transition: 'all 0.3s ease',
            fontFamily: 'Tajawal, Arial, sans-serif',
            lineHeight: 1.6
          }}
          placeholder="أدخل تفاصيل القضية هنا..."
          required
        />
      </div>

      {/* معلومات مساعدة */}
      <div style={{
        marginTop: 12,
        padding: 12,
        background: `${theme.accent}15`,
        borderRadius: 8,
        fontSize: 13,
        color: theme.text,
        opacity: 0.8
      }}>
        💡 <strong>نصيحة:</strong> كلما كانت التفاصيل أكثر دقة ووضوحاً، كانت نتائج التحليل أفضل.
        يمكنك تضمين التواريخ، أسماء الأطراف، والوقائع الأساسية.
      </div>
    </div>
  );
};

export default DataInputSection;