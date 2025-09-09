/**
 * واجهة اختيار نوع القضية المتعددة
 * Multi-Case Type Selection Interface
 */

import React, { useState, useEffect } from 'react';
import { detectCaseType, suggestAdditionalTypes, analyzeCaseComplexity, compareWithOldSystem, CaseTypeDetectionResult } from '../utils/caseTypeDetection';

interface CaseTypeSelectionProps {
  text: string;
  currentType: string;
  onTypeChange: (types: string[]) => void;
  onComplexityChange?: (complexity: any) => void;
  theme: any;
  isMobile: boolean;
  oldSystemDetection?: string; // نوع القضية المكتشف من النظام القديم
}

interface CaseTypeOption {
  type: string;
  confidence?: number;
  reason?: string;
  isCustom?: boolean;
  isAuto?: boolean;
}

export const CaseTypeSelection: React.FC<CaseTypeSelectionProps> = ({
  text,
  currentType,
  onTypeChange,
  onComplexityChange,
  theme,
  isMobile,
  oldSystemDetection
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([currentType]);
  const [detectionResult, setDetectionResult] = useState<CaseTypeDetectionResult | null>(null);
  const [showAutoDetection, setShowAutoDetection] = useState(false);
  const [customType, setCustomType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastDetectedType, setLastDetectedType] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // الأنواع المتاحة مسبقاً
  const predefinedTypes = [
    'عام', 'مدني', 'جنائي', 'تجاري', 'أحوال شخصية',
    'عمالي', 'إداري', 'عقاري', 'ضريبي', 'دستوري', 'بيئي'
  ];

  // إجراء الكشف التلقائي عند تغيير النص
  useEffect(() => {
    if (text && text.length > 20) { // تقليل الحد الأدنى من 50 إلى 20
      setIsAnalyzing(true);
      
      // تقليل التأخير من 1000 إلى 500
      const timer = setTimeout(() => {
        const result = detectCaseType(text);
        setDetectionResult(result);
        setIsAnalyzing(false);
        
        // مقارنة مع النظام القديم إذا وجد
        if (oldSystemDetection) {
          const comparison = compareWithOldSystem(text, oldSystemDetection);
          setComparisonResult(comparison);
        }
        
        // تطبيق تلقائي إذا كانت الثقة عالية
        if (result.confidence > 60 && result.suggestedType !== 'عام') {
          const newTypes = [result.suggestedType];
          setSelectedTypes(newTypes);
          onTypeChange(newTypes);
          setLastDetectedType(result.suggestedType);
          
          // حفظ النتيجة محلياً
          try {
            localStorage.setItem('last_detected_case_type', result.suggestedType);
            localStorage.setItem('last_detection_confidence', result.confidence.toString());
          } catch {}
        }
        
        // تحديث التعقيد
        if (onComplexityChange) {
          const complexity = analyzeCaseComplexity(text, selectedTypes);
          onComplexityChange(complexity);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // مسح النتائج إذا كان النص قصير
      setDetectionResult(null);
      setComparisonResult(null);
    }
  }, [text, oldSystemDetection]);

  // تحديث التعقيد عند تغيير الأنواع
  useEffect(() => {
    if (onComplexityChange && text) {
      const complexity = analyzeCaseComplexity(text, selectedTypes);
      onComplexityChange(complexity);
    }
  }, [selectedTypes]);

  // معالج تغيير النوع
  const handleTypeToggle = (type: string) => {
    let newTypes;
    if (selectedTypes.includes(type)) {
      newTypes = selectedTypes.filter(t => t !== type);
      // التأكد من وجود نوع واحد على الأقل
      if (newTypes.length === 0) {
        newTypes = ['عام'];
      }
    } else {
      newTypes = [...selectedTypes, type];
      // إزالة "عام" إذا تم اختيار نوع آخر
      if (newTypes.includes('عام') && newTypes.length > 1) {
        newTypes = newTypes.filter(t => t !== 'عام');
      }
    }
    
    setSelectedTypes(newTypes);
    onTypeChange(newTypes);
  };

  // تطبيق الاقتراح التلقائي
  const applyAutoSuggestion = () => {
    if (detectionResult) {
      const newTypes = [detectionResult.suggestedType];
      
      // إضافة الأنواع البديلة عالية الثقة
      detectionResult.alternativeTypes.forEach(alt => {
        if (alt.confidence > 30) {
          newTypes.push(alt.type);
        }
      });

      setSelectedTypes(newTypes);
      onTypeChange(newTypes);
    }
  };

  // إضافة نوع مخصص
  const addCustomType = () => {
    if (customType.trim() && !selectedTypes.includes(customType.trim())) {
      const newTypes = [...selectedTypes, customType.trim()];
      setSelectedTypes(newTypes);
      onTypeChange(newTypes);
      setCustomType('');
      setShowCustomInput(false);
    }
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
        ⚖️ اختيار نوع القضية
        {selectedTypes.length > 1 && (
          <span style={{
            background: theme.accent2,
            color: '#fff',
            borderRadius: 12,
            padding: '2px 8px',
            fontSize: 12,
            fontWeight: 'normal'
          }}>
            {selectedTypes.length} أنواع
          </span>
        )}
      </div>

      {/* الكشف التلقائي */}
      {text && text.length > 50 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowAutoDetection(!showAutoDetection)}
            style={{
              background: showAutoDetection ? theme.accent : 'transparent',
              color: showAutoDetection ? '#fff' : theme.accent,
              border: `1px solid ${theme.accent}`,
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              justifyContent: 'center'
            }}
          >
            {isAnalyzing ? (
              <>
                <span style={{
                  width: 16,
                  height: 16,
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                جاري التحليل...
              </>
            ) : (
              <>
                🤖 الكشف التلقائي
                {detectionResult && !showAutoDetection && (
                  <span style={{ opacity: 0.7 }}>
                    (يقترح: {detectionResult.suggestedType})
                  </span>
                )}
              </>
            )}
          </button>

          {/* نتائج الكشف التلقائي */}
          {showAutoDetection && detectionResult && (
            <div style={{
              marginTop: 12,
              padding: 12,
              background: theme.background,
              borderRadius: 8,
              border: `1px solid ${theme.input}`
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <div>
                  <strong>الاقتراح: {detectionResult.suggestedType}</strong>
                  <span style={{
                    marginRight: 8,
                    color: detectionResult.confidence > 70 ? '#10b981' : detectionResult.confidence > 40 ? '#f59e0b' : '#ef4444'
                  }}>
                    ({detectionResult.confidence}% ثقة)
                  </span>
                </div>
                <button
                  onClick={applyAutoSuggestion}
                  style={{
                    background: theme.accent2,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  تطبيق
                </button>
              </div>

              {/* الأسباب */}
              <div style={{ fontSize: 12, color: theme.text, opacity: 0.8 }}>
                {detectionResult.reasons.slice(0, 3).map((reason, index) => (
                  <div key={index}>• {reason}</div>
                ))}
              </div>

              {/* البدائل */}
              {detectionResult.alternativeTypes.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                    بدائل أخرى:
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {detectionResult.alternativeTypes.map((alt, index) => (
                      <button
                        key={index}
                        onClick={() => handleTypeToggle(alt.type)}
                        style={{
                          background: selectedTypes.includes(alt.type) ? theme.accent2 : 'transparent',
                          color: selectedTypes.includes(alt.type) ? '#fff' : theme.text,
                          border: `1px solid ${theme.input}`,
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontSize: 11,
                          cursor: 'pointer'
                        }}
                      >
                        {alt.type} ({alt.confidence}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* الأنواع المحددة مسبقاً */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 'bold',
          marginBottom: 8,
          color: theme.text
        }}>
          الأنواع المتاحة:
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: 8
        }}>
          {predefinedTypes.map(type => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              style={{
                background: selectedTypes.includes(type) ? theme.accent : 'transparent',
                color: selectedTypes.includes(type) ? '#fff' : theme.text,
                border: `1px solid ${selectedTypes.includes(type) ? theme.accent : theme.input}`,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: selectedTypes.includes(type) ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
            >
              {selectedTypes.includes(type) && '✓ '}
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* إضافة نوع مخصص */}
      <div>
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            style={{
              background: 'transparent',
              color: theme.accent2,
              border: `1px dashed ${theme.accent2}`,
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            ➕ إضافة نوع مخصص
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="اكتب نوع القضية المخصص..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `1px solid ${theme.input}`,
                borderRadius: 6,
                background: theme.background,
                color: theme.text,
                fontSize: 13
              }}
              onKeyPress={(e) => e.key === 'Enter' && addCustomType()}
            />
            <button
              onClick={addCustomType}
              disabled={!customType.trim()}
              style={{
                background: theme.accent2,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 13,
                cursor: customType.trim() ? 'pointer' : 'not-allowed',
                opacity: customType.trim() ? 1 : 0.5
              }}
            >
              إضافة
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomType('');
              }}
              style={{
                background: 'transparent',
                color: theme.text,
                border: `1px solid ${theme.input}`,
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              إلغاء
            </button>
          </div>
        )}
      </div>

      {/* مقارنة مع النظام القديم */}
      {comparisonResult && oldSystemDetection && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: comparisonResult.isMatch 
            ? `${theme.accent}15` 
            : comparisonResult.accuracy === 'new_better'
              ? '#10b98115'
              : '#f59e0b15',
          borderRadius: 8,
          border: `1px solid ${
            comparisonResult.isMatch 
              ? theme.accent 
              : comparisonResult.accuracy === 'new_better'
                ? '#10b981'
                : '#f59e0b'
          }`,
          fontSize: 13
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            fontWeight: 'bold',
            color: comparisonResult.isMatch 
              ? theme.accent 
              : comparisonResult.accuracy === 'new_better'
                ? '#10b981'
                : '#f59e0b'
          }}>
            {comparisonResult.isMatch ? '✅' : '⚠️'} مقارنة مع النتيجة السابقة
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <strong>النظام السابق:</strong> {oldSystemDetection}
            <br />
            <strong>النظام الجديد:</strong> {comparisonResult.newDetection.suggestedType} 
            ({comparisonResult.newDetection.confidence}% ثقة)
          </div>
          
          <div style={{
            padding: 8,
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: 4,
            fontStyle: 'italic',
            color: theme.text
          }}>
            💡 {comparisonResult.recommendation}
          </div>
          
          {!comparisonResult.isMatch && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => {
                  const combinedTypes = [oldSystemDetection, comparisonResult.newDetection.suggestedType];
                  setSelectedTypes(combinedTypes);
                  onTypeChange(combinedTypes);
                }}
                style={{
                  background: theme.accent2,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 11,
                  cursor: 'pointer',
                  marginRight: 6
                }}
              >
                🔗 دمج النتيجتين
              </button>
              <button
                onClick={() => {
                  setSelectedTypes([oldSystemDetection]);
                  onTypeChange([oldSystemDetection]);
                }}
                style={{
                  background: 'transparent',
                  color: theme.accent,
                  border: `1px solid ${theme.accent}`,
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                🔄 استخدم السابق
              </button>
            </div>
          )}
        </div>
      )}

      {/* معلومات إضافية */}
      {selectedTypes.length > 1 && (
        <div style={{
          marginTop: 12,
          padding: 8,
          background: `${theme.accent}15`,
          borderRadius: 6,
          fontSize: 12,
          color: theme.text
        }}>
          💡 تم اختيار عدة أنواع - سيتم تخصيص المراحل وفقاً لذلك
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CaseTypeSelection;