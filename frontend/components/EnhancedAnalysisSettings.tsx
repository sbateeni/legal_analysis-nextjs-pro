/**
 * واجهة إعدادات التحليل المحسن
 * Enhanced Analysis Settings Interface
 */

import React, { useState, useEffect } from 'react';

interface AnalysisSettingsProps {
  onConfigChange: (config: any) => void;
  theme: any;
  isMobile: boolean;
}

export const EnhancedAnalysisSettings: React.FC<AnalysisSettingsProps> = ({
  onConfigChange,
  theme,
  isMobile
}) => {
  const [config, setConfig] = useState({
    maxRetries: 8,
    baseDelay: 5000,
    maxDelay: 45000,
    criticalStageRetries: 12,
    failureRecoveryMode: 'retry_with_context' as 'skip' | 'retry_with_context' | 'block_until_success',
    qualityOverSpeed: true,
    patientMode: false
  });

  const [presetMode, setPresetMode] = useState<'balanced' | 'fast' | 'robust' | 'patient' | 'custom'>('balanced');

  // إعدادات محددة مسبقاً
  const presets = {
    fast: {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 15000,
      criticalStageRetries: 5,
      failureRecoveryMode: 'skip' as const,
      qualityOverSpeed: false,
      patientMode: false
    },
    balanced: {
      maxRetries: 5,
      baseDelay: 3000,
      maxDelay: 30000,
      criticalStageRetries: 8,
      failureRecoveryMode: 'retry_with_context' as const,
      qualityOverSpeed: true,
      patientMode: false
    },
    robust: {
      maxRetries: 8,
      baseDelay: 5000,
      maxDelay: 45000,
      criticalStageRetries: 12,
      failureRecoveryMode: 'retry_with_context' as const,
      qualityOverSpeed: true,
      patientMode: false
    },
    patient: {
      maxRetries: 15,
      baseDelay: 8000,
      maxDelay: 60000,
      criticalStageRetries: 20,
      failureRecoveryMode: 'block_until_success' as const,
      qualityOverSpeed: true,
      patientMode: true
    }
  };

  // تحديث الإعدادات عند تغيير النمط المحدد مسبقاً
  useEffect(() => {
    if (presetMode !== 'custom') {
      const newConfig = presets[presetMode];
      setConfig(newConfig);
      onConfigChange(newConfig);
    }
  }, [presetMode]);

  // تحديث الإعدادات المخصصة
  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setPresetMode('custom');
    onConfigChange(newConfig);
  };

  return (
    <div style={{
      background: theme.card,
      borderRadius: 12,
      padding: isMobile ? 16 : 20,
      marginBottom: 16,
      border: `1px solid ${theme.border}`,
      boxShadow: `0 2px 10px ${theme.shadow}`
    }}>
      {/* العنوان */}
      <div style={{
        fontSize: isMobile ? 16 : 18,
        fontWeight: 'bold',
        color: theme.accent,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        ⚙️ إعدادات التحليل المحسن
      </div>

      {/* الأنماط المحددة مسبقاً */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 10,
          color: theme.text
        }}>
          اختر نمط التحليل:
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 8
        }}>
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setPresetMode(key as any)}
              style={{
                background: presetMode === key ? theme.accent : 'transparent',
                color: presetMode === key ? '#fff' : theme.text,
                border: `1px solid ${presetMode === key ? theme.accent : theme.input}`,
                borderRadius: 8,
                padding: '10px 8px',
                fontSize: 12,
                fontWeight: presetMode === key ? 'bold' : 'normal',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
            >
              {key === 'fast' && '⚡ سريع'}
              {key === 'balanced' && '⚖️ متوازن'}
              {key === 'robust' && '🛡️ قوي'}
              {key === 'patient' && '🕐 صبور'}
            </button>
          ))}
          <button
            onClick={() => setPresetMode('custom')}
            style={{
              background: presetMode === 'custom' ? theme.accent2 : 'transparent',
              color: presetMode === 'custom' ? '#fff' : theme.text,
              border: `1px solid ${presetMode === 'custom' ? theme.accent2 : theme.input}`,
              borderRadius: 8,
              padding: '10px 8px',
              fontSize: 12,
              fontWeight: presetMode === 'custom' ? 'bold' : 'normal',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
          >
            🔧 مخصص
          </button>
        </div>
      </div>

      {/* وصف النمط المختار */}
      <div style={{
        background: `${theme.accent}15`,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 13,
        color: theme.text
      }}>
        {presetMode === 'fast' && (
          <div>
            <strong>⚡ النمط السريع:</strong> أقل عدد محاولات، انتظار قصير، تخطي المراحل الفاشلة.
            مناسب للاختبار السريع.
          </div>
        )}
        {presetMode === 'balanced' && (
          <div>
            <strong>⚖️ النمط المتوازن:</strong> توازن بين السرعة والجودة، محاولات معقولة، 
            استخدام السياق عند الفشل. الأفضل للاستخدام العام.
          </div>
        )}
        {presetMode === 'robust' && (
          <div>
            <strong>🛡️ النمط القوي:</strong> محاولات أكثر، انتظار أطول، مقاومة عالية للأخطاء.
            مناسب للقضايا المهمة.
          </div>
        )}
        {presetMode === 'patient' && (
          <div>
            <strong>🕐 النمط الصبور:</strong> أقصى عدد محاولات، لا تخطي المراحل الحرجة،
            جودة عالية مضمونة. <span style={{ color: theme.accent, fontWeight: 'bold' }}>موصى به للنتائج المثالية!</span>
          </div>
        )}
        {presetMode === 'custom' && (
          <div>
            <strong>🔧 إعدادات مخصصة:</strong> يمكنك تخصيص كل إعداد حسب احتياجاتك.
          </div>
        )}
      </div>

      {/* الإعدادات المفصلة (للنمط المخصص أو العرض) */}
      {(presetMode === 'custom' || true) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 16
        }}>
          {/* عدد المحاولات العادية */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 'bold',
              marginBottom: 6,
              color: theme.text
            }}>
              عدد المحاولات للمراحل العادية: {config.maxRetries}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={config.maxRetries}
              onChange={(e) => handleConfigChange('maxRetries', parseInt(e.target.value))}
              disabled={presetMode !== 'custom'}
              style={{
                width: '100%',
                opacity: presetMode !== 'custom' ? 0.6 : 1
              }}
            />
            <div style={{ fontSize: 11, color: theme.text, opacity: 0.7, marginTop: 2 }}>
              1 = سريع جداً، 20 = صبور جداً
            </div>
          </div>

          {/* عدد المحاولات للمراحل الحرجة */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 'bold',
              marginBottom: 6,
              color: theme.text
            }}>
              عدد المحاولات للمراحل الحرجة: {config.criticalStageRetries}
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={config.criticalStageRetries}
              onChange={(e) => handleConfigChange('criticalStageRetries', parseInt(e.target.value))}
              disabled={presetMode !== 'custom'}
              style={{
                width: '100%',
                opacity: presetMode !== 'custom' ? 0.6 : 1
              }}
            />
            <div style={{ fontSize: 11, color: theme.text, opacity: 0.7, marginTop: 2 }}>
              المراحل الأساسية تحتاج محاولات أكثر
            </div>
          </div>

          {/* فترة الانتظار الأساسية */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 'bold',
              marginBottom: 6,
              color: theme.text
            }}>
              فترة الانتظار الأساسية: {config.baseDelay / 1000}ث
            </label>
            <input
              type="range"
              min="1000"
              max="15000"
              step="1000"
              value={config.baseDelay}
              onChange={(e) => handleConfigChange('baseDelay', parseInt(e.target.value))}
              disabled={presetMode !== 'custom'}
              style={{
                width: '100%',
                opacity: presetMode !== 'custom' ? 0.6 : 1
              }}
            />
            <div style={{ fontSize: 11, color: theme.text, opacity: 0.7, marginTop: 2 }}>
              فترة انتظار بين المراحل والمحاولات
            </div>
          </div>

          {/* أقصى فترة انتظار */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 'bold',
              marginBottom: 6,
              color: theme.text
            }}>
              أقصى فترة انتظار: {config.maxDelay / 1000}ث
            </label>
            <input
              type="range"
              min="15000"
              max="120000"
              step="5000"
              value={config.maxDelay}
              onChange={(e) => handleConfigChange('maxDelay', parseInt(e.target.value))}
              disabled={presetMode !== 'custom'}
              style={{
                width: '100%',
                opacity: presetMode !== 'custom' ? 0.6 : 1
              }}
            />
            <div style={{ fontSize: 11, color: theme.text, opacity: 0.7, marginTop: 2 }}>
              أقصى انتظار عند مشاكل الشبكة
            </div>
          </div>
        </div>
      )}

      {/* إعدادات متقدمة */}
      <div style={{ marginTop: 20 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 12,
          color: theme.text
        }}>
          إعدادات متقدمة:
        </div>

        {/* وضع التعامل مع الفشل */}
        <div style={{ marginBottom: 12 }}>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 'bold',
            marginBottom: 6,
            color: theme.text
          }}>
            وضع التعامل مع فشل المراحل:
          </label>
          <select
            value={config.failureRecoveryMode}
            onChange={(e) => handleConfigChange('failureRecoveryMode', e.target.value)}
            disabled={presetMode !== 'custom'}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme.input}`,
              borderRadius: 6,
              background: theme.background,
              color: theme.text,
              fontSize: 13,
              opacity: presetMode !== 'custom' ? 0.6 : 1
            }}
          >
            <option value="skip">تخطي المراحل الفاشلة</option>
            <option value="retry_with_context">إعادة المحاولة مع السياق</option>
            <option value="block_until_success">عدم المتابعة حتى النجاح</option>
          </select>
        </div>

        {/* مفاتيح التشغيل */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: theme.text,
            cursor: presetMode === 'custom' ? 'pointer' : 'default',
            opacity: presetMode !== 'custom' ? 0.6 : 1
          }}>
            <input
              type="checkbox"
              checked={config.qualityOverSpeed}
              onChange={(e) => handleConfigChange('qualityOverSpeed', e.target.checked)}
              disabled={presetMode !== 'custom'}
              style={{ cursor: presetMode === 'custom' ? 'pointer' : 'default' }}
            />
            أولوية الجودة على السرعة
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: theme.text,
            cursor: presetMode === 'custom' ? 'pointer' : 'default',
            opacity: presetMode !== 'custom' ? 0.6 : 1
          }}>
            <input
              type="checkbox"
              checked={config.patientMode}
              onChange={(e) => handleConfigChange('patientMode', e.target.checked)}
              disabled={presetMode !== 'custom'}
              style={{ cursor: presetMode === 'custom' ? 'pointer' : 'default' }}
            />
            النمط الصبور (أفضل النتائج)
          </label>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div style={{
        marginTop: 16,
        padding: 12,
        background: `${theme.accent2}15`,
        borderRadius: 8,
        fontSize: 12,
        color: theme.text
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 6 }}>💡 نصائح للحصول على أفضل النتائج:</div>
        <ul style={{ margin: 0, paddingRight: 16 }}>
          <li>استخدم \"النمط الصبور\" للقضايا المهمة - لا يهم الوقت المستغرق</li>
          <li>زيادة عدد المحاولات تقلل فرص فشل المراحل</li>
          <li>فترات الانتظار الأطول تتجنب مشاكل حدود الاستخدام</li>
          <li>وضع \"عدم المتابعة حتى النجاح\" يضمن اكتمال كل المراحل</li>
        </ul>
      </div>

      {/* تقدير الوقت */}
      <div style={{
        marginTop: 12,
        padding: 10,
        background: theme.background,
        borderRadius: 6,
        fontSize: 12,
        color: theme.text,
        opacity: 0.8
      }}>
        <strong>تقدير الوقت المتوقع:</strong> {estimateAnalysisTime(config)} دقيقة
        {config.patientMode && (
          <span style={{ color: theme.accent, fontWeight: 'bold' }}>
            {" "}- جودة عالية مضمونة! 🎯
          </span>
        )}
      </div>
    </div>
  );
};

// دالة تقدير الوقت
function estimateAnalysisTime(config: any): string {
  const baseTimePerStage = 30; // ثانية
  const retryTime = config.maxRetries * (config.baseDelay / 1000);
  const totalStages = 34; // عدد المراحل الافتراضي
  
  const estimatedSeconds = (baseTimePerStage + retryTime) * totalStages;
  const minutes = Math.round(estimatedSeconds / 60);
  
  if (config.patientMode) {
    return `${minutes * 1.5}-${minutes * 2}`;
  } else if (config.qualityOverSpeed) {
    return `${minutes}-${minutes * 1.3}`;
  } else {
    return `${minutes * 0.7}-${minutes}`;
  }
}

export default EnhancedAnalysisSettings;