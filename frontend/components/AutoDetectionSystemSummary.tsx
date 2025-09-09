/**
 * ملخص نظام الكشف التلقائي والمراحل المخصصة
 * Summary component for the automatic detection and custom stages system
 */

import React from 'react';

interface SystemSummaryProps {
  theme: any;
  isMobile: boolean;
}

export const AutoDetectionSystemSummary: React.FC<SystemSummaryProps> = ({ theme, isMobile }) => {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.accent}15 0%, ${theme.accent2}15 100%)`,
      borderRadius: 16,
      padding: isMobile ? 16 : 24,
      marginBottom: 24,
      border: `1px solid ${theme.accent}30`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* خلفية زخرفية */}
      <div style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 100,
        height: 100,
        background: `${theme.accent}10`,
        borderRadius: '50%',
        opacity: 0.5
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16
        }}>
          <span style={{ fontSize: 32 }}>🎉</span>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? 18 : 22,
              fontWeight: 'bold',
              color: theme.accent,
              marginBottom: 4
            }}>
              نظام الكشف التلقائي والمراحل المخصصة
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: theme.text,
              opacity: 0.8
            }}>
              تم تطبيق الحل الأول المقترح بنجاح - الكشف التلقائي مع إمكانية التعديل اليدوي
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 16
        }}>
          {/* المرحلة الأولى */}
          <div style={{
            background: theme.card,
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8
            }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <h4 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.accent2
              }}>
                المرحلة الأولى
              </h4>
            </div>
            <h5 style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 8,
              color: theme.text
            }}>
              الكشف التلقائي
            </h5>
            <ul style={{
              margin: 0,
              paddingRight: 16,
              fontSize: 12,
              color: theme.text,
              opacity: 0.8
            }}>
              <li>تحليل النص تلقائياً</li>
              <li>اقتراح نوع القضية</li>
              <li>حساب نسبة الثقة</li>
              <li>عرض البدائل</li>
            </ul>
          </div>

          {/* المرحلة الثانية */}
          <div style={{
            background: theme.card,
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8
            }}>
              <span style={{ fontSize: 20 }}>🎛️</span>
              <h4 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.accent2
              }}>
                المرحلة الثانية
              </h4>
            </div>
            <h5 style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 8,
              color: theme.text
            }}>
              الاختيار المتعدد
            </h5>
            <ul style={{
              margin: 0,
              paddingRight: 16,
              fontSize: 12,
              color: theme.text,
              opacity: 0.8
            }}>
              <li>اختيار أنواع متعددة</li>
              <li>تعديل الاقتراحات</li>
              <li>إضافة أنواع مخصصة</li>
              <li>تحليل التعقيد</li>
            </ul>
          </div>

          {/* المرحلة الثالثة */}
          <div style={{
            background: theme.card,
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8
            }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <h4 style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.accent2
              }}>
                المرحلة الثالثة
              </h4>
            </div>
            <h5 style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 8,
              color: theme.text
            }}>
              المراحل المخصصة
            </h5>
            <ul style={{
              margin: 0,
              paddingRight: 16,
              fontSize: 12,
              color: theme.text,
              opacity: 0.8
            }}>
              <li>مراحل مخصصة لكل نوع</li>
              <li>تكامل مع المراحل الأساسية</li>
              <li>تقدير المدة والتعقيد</li>
              <li>اقتراحات ذكية إضافية</li>
            </ul>
          </div>
        </div>

        {/* الميزات الرئيسية */}
        <div style={{
          background: theme.background,
          borderRadius: 12,
          padding: 16,
          border: `1px solid ${theme.border}`
        }}>
          <h4 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.accent,
            marginBottom: 12,
            textAlign: 'center'
          }}>
            ✨ الميزات المطبقة
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 8,
            fontSize: 13
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span>
              <span>كشف تلقائي ذكي للنص</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span>
              <span>اختيار أنواع متعددة</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span>
              <span>مراحل مخصصة لكل نوع</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span>
              <span>تحليل تعقيد القضية</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span>
              <span>إمكانية التعديل اليدوي</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span>
              <span>واجهة تفاعلية متطورة</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span>
              <span>تقدير زمني دقيق</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✅</span>
              <span>اقتراحات ذكية إضافية</span>
            </div>
          </div>
        </div>

        {/* رسالة نجاح */}
        <div style={{
          textAlign: 'center',
          marginTop: 16,
          padding: 12,
          background: `${theme.accent}20`,
          borderRadius: 8,
          border: `1px solid ${theme.accent}40`
        }}>
          <p style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 'bold',
            color: theme.accent
          }}>
            🎊 تم تطبيق النظام المطلوب بنجاح! 🎊
          </p>
          <p style={{
            margin: 0,
            fontSize: 12,
            color: theme.text,
            opacity: 0.8,
            marginTop: 4
          }}>
            النظام الآن يقترح تلقائياً، المستخدم يمكنه التعديل، والمراحل تتكيف حسب الاختيار
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutoDetectionSystemSummary;