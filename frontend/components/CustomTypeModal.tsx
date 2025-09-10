import React, { useState } from 'react';
import { CASE_TYPE_CONFIG } from '../types/caseTypes';

interface CustomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customType: CustomTypeData) => void;
  theme: any;
  isMobile: boolean;
}

interface CustomTypeData {
  name: string;
  keywords: string[];
  inheritsFrom: string;
  customStages: string[];
}

export const CustomTypeModal: React.FC<CustomTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  theme,
  isMobile
}) => {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [inheritsFrom, setInheritsFrom] = useState('عام');
  const [customStages, setCustomStages] = useState<string[]>(['']);
  const [errors, setErrors] = useState<string[]>([]);

  const predefinedTypes = Object.keys(CASE_TYPE_CONFIG);

  const handleSave = () => {
    const newErrors: string[] = [];
    
    if (!name.trim()) {
      newErrors.push('اسم النوع مطلوب');
    }
    
    if (name.trim() && predefinedTypes.includes(name.trim())) {
      newErrors.push('هذا النوع موجود مسبقاً');
    }

    if (customStages.length === 0 || customStages.every(s => !s.trim())) {
      newErrors.push('يجب إضافة مرحلة واحدة على الأقل');
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      const customTypeData: CustomTypeData = {
        name: name.trim(),
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        inheritsFrom,
        customStages: customStages.filter(s => s.trim())
      };
      
      onSave(customTypeData);
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setKeywords('');
    setInheritsFrom('عام');
    setCustomStages(['']);
    setErrors([]);
    onClose();
  };

  const addStage = () => {
    setCustomStages([...customStages, '']);
  };

  const removeStage = (index: number) => {
    if (customStages.length > 1) {
      setCustomStages(customStages.filter((_, i) => i !== index));
    }
  };

  const updateStage = (index: number, value: string) => {
    const newStages = [...customStages];
    newStages[index] = value;
    setCustomStages(newStages);
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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? 16 : 24
    }}>
      <div style={{
        background: theme.card,
        borderRadius: 16,
        padding: isMobile ? 20 : 24,
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        border: `1px solid ${theme.border}`
      }}>
        {/* العنوان */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20
        }}>
          <h3 style={{
            color: theme.accent,
            fontSize: isMobile ? 18 : 20,
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            ➕ إنشاء نوع قضية مخصص
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.text,
              fontSize: 24,
              cursor: 'pointer',
              padding: 4
            }}
          >
            ×
          </button>
        </div>

        {/* رسائل الخطأ */}
        {errors.length > 0 && (
          <div style={{
            background: '#ef444415',
            border: '1px solid #ef4444',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16
          }}>
            <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: 8 }}>
              ⚠️ يرجى تصحيح الأخطاء التالية:
            </div>
            <ul style={{ margin: 0, paddingRight: 16, color: '#ef4444' }}>
              {errors.map((error, index) => (
                <li key={index} style={{ fontSize: 13 }}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* اسم النوع */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 6
          }}>
            اسم النوع المخصص *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: عقود البناء، منازعات التقنية..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${theme.input}`,
              borderRadius: 8,
              background: theme.background,
              color: theme.text,
              fontSize: 14
            }}
          />
        </div>

        {/* الكلمات المفتاحية */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 6
          }}>
            الكلمات المفتاحية (اختياري)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="مفصولة بفواصل: عقد، بناء، مقاول، تأخير..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${theme.input}`,
              borderRadius: 8,
              background: theme.background,
              color: theme.text,
              fontSize: 14
            }}
          />
          <div style={{ fontSize: 12, color: theme.text, opacity: 0.7, marginTop: 4 }}>
            تساعد في الكشف التلقائي للنوع
          </div>
        </div>

        {/* الوراثة من نوع أساسي */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 6
          }}>
            يرث من النوع الأساسي
          </label>
          <select
            value={inheritsFrom}
            onChange={(e) => setInheritsFrom(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${theme.input}`,
              borderRadius: 8,
              background: theme.background,
              color: theme.text,
              fontSize: 14
            }}
          >
            {predefinedTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: theme.text, opacity: 0.7, marginTop: 4 }}>
            سيتم دمج مراحل هذا النوع مع المراحل المخصصة
          </div>
        </div>

        {/* المراحل المخصصة */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <label style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: theme.text
            }}>
              المراحل المخصصة *
            </label>
            <button
              onClick={addStage}
              style={{
                background: theme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              ➕ إضافة مرحلة
            </button>
          </div>

          {customStages.map((stage, index) => (
            <div key={index} style={{
              display: 'flex',
              gap: 8,
              marginBottom: 8,
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={stage}
                onChange={(e) => updateStage(index, e.target.value)}
                placeholder={`المرحلة المخصصة ${index + 1}...`}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${theme.input}`,
                  borderRadius: 6,
                  background: theme.background,
                  color: theme.text,
                  fontSize: 13
                }}
              />
              {customStages.length > 1 && (
                <button
                  onClick={() => removeStage(index)}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        {/* معاينة النوع */}
        {name.trim() && (
          <div style={{
            background: theme.background,
            border: `1px solid ${theme.input}`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 20
          }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: theme.accent }}>
              معاينة النوع المخصص
            </div>
            <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.5 }}>
              <div><strong>الاسم:</strong> {name}</div>
              <div><strong>يرث من:</strong> {inheritsFrom}</div>
              <div><strong>الكلمات المفتاحية:</strong> {keywords || 'لا توجد'}</div>
              <div><strong>المراحل المخصصة:</strong> {customStages.filter(s => s.trim()).length}</div>
            </div>
          </div>
        )}

        {/* أزرار التحكم */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              color: theme.text,
              border: `1px solid ${theme.input}`,
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            style={{
              background: theme.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            حفظ النوع المخصص
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTypeModal;
