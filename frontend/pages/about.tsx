import React from 'react';
import { isMobile } from '@utils/crypto';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutPage() {
  return <AboutPageContent />;
}

function AboutPageContent() {
  const { theme } = useTheme();

  return (
        <div style={{
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: 'Tajawal, Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        padding: isMobile() ? '1rem' : '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: isMobile() ? '1.5rem' : '2rem' }}>
            📖 تعليمات النظام
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: isMobile() ? '0.9rem' : '1rem' }}>
            دليل شامل لاستخدام نظام التحليل القانوني الفلسطيني
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile() ? '1rem' : '2rem' }}>
        <div style={{
          background: theme.card,
          padding: isMobile() ? '1rem' : '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: `0 1px 3px ${theme.shadow}`,
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>🎯 حول النظام</h2>
          <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>
            نظام التحليل القانوني الفلسطيني هو منصة ذكية متخصصة في تحليل القضايا القانونية 
            باستخدام الذكاء الاصطناعي والمصادر القانونية الفلسطينية الرسمية.
          </p>
          <p style={{ lineHeight: 1.6 }}>
            يوفر النظام تحليلاً شاملاً للقضايا مع إمكانية التنبؤ بنتائجها وتقديم توصيات قانونية 
            مبنية على القوانين والأحكام الفلسطينية النافذة.
          </p>
        </div>

        <div style={{
          background: theme.card,
          padding: isMobile() ? '1rem' : '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: `0 1px 3px ${theme.shadow}`,
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>🚀 الميزات الرئيسية</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile() ? '1fr' : 'repeat(2, 1fr)',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              background: '#f0f9ff',
              borderRadius: '0.5rem',
              border: '1px solid #0ea5e9'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e' }}>🤖 المساعد الذكي</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c4a6e' }}>
                محادثة ذكية مع مساعد قانوني متخصص في القوانين الفلسطينية
              </p>
            </div>
            
            <div style={{
              padding: '1rem',
              background: '#f0fdf4',
              borderRadius: '0.5rem',
              border: '1px solid #10b981'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>📊 التحليلات</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}>
                تحليل تنبؤي للقضايا مع احتمالات النجاح والتوصيات
              </p>
            </div>
            
            <div style={{
              padding: '1rem',
              background: '#fef3c7',
              borderRadius: '0.5rem',
              border: '1px solid #f59e0b'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>🔍 البحث المتقدم</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>
                بحث دلالي ذكي في القوانين والأحكام الفلسطينية
              </p>
            </div>
            
            <div style={{
              padding: '1rem',
              background: '#fdf2f8',
              borderRadius: '0.5rem',
              border: '1px solid #ec4899'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#be185d' }}>📋 إدارة القضايا</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#be185d' }}>
                إدارة شاملة للقضايا مع التقويم والمستندات
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: theme.card,
          padding: isMobile() ? '1rem' : '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: `0 1px 3px ${theme.shadow}`,
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>📚 المصادر القانونية</h2>
          <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>
            يعتمد النظام على المصادر القانونية الفلسطينية الرسمية:
          </p>
          <ul style={{ lineHeight: 1.8, paddingRight: '1.5rem' }}>
            <li><strong>المقتفي</strong> - منظومة القضاء والتشريع الفلسطيني</li>
            <li><strong>مقام</strong> - التشريعات والأحكام القضائية</li>
            <li><strong>قاعدة المعرفة</strong> - الأبحاث والدراسات القانونية</li>
            <li><strong>المصادر الدولية</strong> - القرارات والأحكام ذات الصلة</li>
              </ul>
            </div>
            
        <div style={{
          background: theme.card,
          padding: isMobile() ? '1rem' : '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: `0 1px 3px ${theme.shadow}`,
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>⚖️ إخلاء المسؤولية</h2>
          <div style={{
            padding: '1rem',
            background: '#fef2f2',
            borderRadius: '0.5rem',
            border: '1px solid #fecaca'
          }}>
            <p style={{ margin: 0, color: '#dc2626', lineHeight: 1.6 }}>
              <strong>تنبيه مهم:</strong> هذا النظام مخصص للتثقيف والدعم القانوني وليس بديلاً عن 
              استشارة محامٍ مرخص في فلسطين. يُنصح دائماً بالتشاور مع محامٍ متخصص للحصول على 
              استشارة قانونية رسمية.
            </p>
          </div>
        </div>

        <div style={{
          background: theme.card,
          padding: isMobile() ? '1rem' : '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: `0 1px 3px ${theme.shadow}`
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: theme.text }}>📞 الدعم والمساعدة</h2>
          <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>
            إذا كنت بحاجة إلى مساعدة أو لديك استفسارات حول النظام، يمكنك:
          </p>
          <ul style={{ lineHeight: 1.8, paddingRight: '1.5rem' }}>
            <li>استخدام المساعد الذكي للحصول على إجابات فورية</li>
            <li>الرجوع إلى دليل الاستخدام في كل صفحة</li>
            <li>التواصل مع فريق الدعم التقني</li>
        </ul>
        </div>
      </main>
    </div>
  );
} 