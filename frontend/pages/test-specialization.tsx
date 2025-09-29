import React, { useState } from 'react';
import Head from 'next/head';
import { buildSpecializedStages, CASE_TYPE_CONFIG } from '../types/caseTypes';
import { useTheme } from '../contexts/ThemeContext';

/**
 * صفحة اختبار نظام التخصصات والمراحل
 * Test page for specialization and stages system
 */
export default function TestSpecializationPage() {
  const { theme, darkMode } = useTheme();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['عام']);
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
  const [includeOptionals, setIncludeOptionals] = useState(false);

  const predefinedTypes = Object.keys(CASE_TYPE_CONFIG);
  const specializedStages = buildSpecializedStages(selectedTypes, mode === 'advanced' && includeOptionals);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <>
      <Head>
        <title>اختبار نظام التخصصات - Test Specialization System</title>
        <meta name="description" content="صفحة اختبار نظام ربط التخصصات بالمراحل" />
      </Head>
      
      <div style={{ 
        padding: '2rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        fontFamily: 'Tajawal, Arial, sans-serif',
        direction: 'rtl',
        background: theme.background,
        color: theme.text,
        minHeight: '100vh'
      }}>
        <h1 style={{ 
          color: theme.accent, 
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '2rem'
        }}>
          🧪 اختبار نظام التخصصات والمراحل
        </h1>
        
        {/* إعدادات الاختبار */}
        <div style={{ 
          background: theme.card, 
          padding: '1.5rem', 
          borderRadius: '12px',
          marginBottom: '2rem',
          border: `1px solid ${theme.border}`
        }}>
          <h2 style={{ color: theme.accent, marginBottom: '1rem' }}>
            ⚙️ إعدادات الاختبار
          </h2>
          
          {/* وضع الاختبار */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              وضع الاختبار:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setMode('basic')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid ' + theme.input,
                  background: mode === 'basic' ? theme.accent : 'transparent',
                  color: mode === 'basic' ? '#fff' : theme.text,
                  cursor: 'pointer'
                }}
              >
                أساسي
              </button>
              <button
                onClick={() => setMode('advanced')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid ' + theme.input,
                  background: mode === 'advanced' ? theme.accent : 'transparent',
                  color: mode === 'advanced' ? '#fff' : theme.text,
                  cursor: 'pointer'
                }}
              >
                متقدم
              </button>
            </div>
          </div>

          {/* تضمين المراحل الاختيارية */}
          {mode === 'advanced' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={includeOptionals} 
                  onChange={(e) => setIncludeOptionals(e.target.checked)}
                />
                تضمين المراحل الاختيارية
              </label>
            </div>
          )}

          {/* اختيار الأنواع */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              أنواع القضايا المختارة:
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '8px' 
            }}>
              {predefinedTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${selectedTypes.includes(type) ? theme.accent : theme.input}`,
                    background: selectedTypes.includes(type) ? theme.accent : 'transparent',
                    color: selectedTypes.includes(type) ? '#fff' : theme.text,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {selectedTypes.includes(type) && '✓ '}
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* نتائج الاختبار */}
        <div style={{ 
          background: theme.card, 
          padding: '1.5rem', 
          borderRadius: '12px',
          marginBottom: '2rem',
          border: `1px solid ${theme.border}`
        }}>
          <h2 style={{ color: theme.accent, marginBottom: '1rem' }}>
            📊 نتائج الاختبار
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              background: theme.background, 
              padding: '1rem', 
              borderRadius: '8px',
              border: `1px solid ${theme.input}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.accent }}>
                الأنواع المختارة
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '0.5rem' }}>
                {selectedTypes.length}
              </div>
            </div>
            
            <div style={{ 
              background: theme.background, 
              padding: '1rem', 
              borderRadius: '8px',
              border: `1px solid ${theme.input}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.accent }}>
                المراحل المتخصصة
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '0.5rem' }}>
                {specializedStages.length}
              </div>
            </div>
            
            <div style={{ 
              background: theme.background, 
              padding: '1rem', 
              borderRadius: '8px',
              border: `1px solid ${theme.input}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.accent }}>
                الوضع
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '0.5rem' }}>
                {mode === 'basic' ? 'أساسي' : 'متقدم'}
              </div>
            </div>
          </div>

          {/* تفاصيل المراحل المتخصصة */}
          {specializedStages.length > 0 && (
            <div>
              <h3 style={{ color: theme.text, marginBottom: '1rem' }}>
                المراحل المتخصصة المولدة:
              </h3>
              <div style={{ 
                background: theme.background, 
                padding: '1rem', 
                borderRadius: '8px',
                border: `1px solid ${theme.input}`
              }}>
                {specializedStages.map((stage, index) => (
                  <div key={index} style={{
                    padding: '8px 12px',
                    marginBottom: '4px',
                    background: theme.card,
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    fontSize: '14px'
                  }}>
                    {index + 1}. {stage}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تفاصيل التكوين */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: theme.text, marginBottom: '1rem' }}>
              تفاصيل التكوين لكل نوع:
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1rem'
            }}>
              {selectedTypes.map(type => {
                const config = CASE_TYPE_CONFIG[type];
                if (!config) return null;
                
                return (
                  <div key={type} style={{
                    background: theme.background,
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `1px solid ${theme.input}`
                  }}>
                    <h4 style={{ color: theme.accent, marginBottom: '0.5rem' }}>
                      {type}
                    </h4>
                    <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                      <div><strong>المراحل الأساسية:</strong> {config.defaultStages.length}</div>
                      <div><strong>المراحل الاختيارية:</strong> {config.optionalStages?.length || 0}</div>
                      {config.keywords && (
                        <div><strong>الكلمات المفتاحية:</strong> {config.keywords.join(', ')}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* تعليمات الاستخدام */}
        <div style={{ 
          background: theme.card, 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: `1px solid ${theme.border}`
        }}>
          <h2 style={{ color: theme.accent, marginBottom: '1rem' }}>
            📖 تعليمات الاستخدام
          </h2>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <ol style={{ paddingRight: '1.5rem' }}>
              <li>اختر نوع أو أكثر من أنواع القضايا من القائمة أعلاه</li>
              <li>حدد الوضع: أساسي (المراحل الأساسية فقط) أو متقدم (يشمل الاختيارية)</li>
              <li>في الوضع المتقدم، يمكنك تفعيل المراحل الاختيارية</li>
              <li>ستظهر المراحل المتخصصة تلقائياً في قسم "النتائج"</li>
              <li>هذه المراحل ستُدمج مع المراحل الأساسية في النظام الرئيسي</li>
            </ol>
          </div>
        </div>

        {/* زر العودة */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem'
        }}>
          <a 
            href="/" 
            style={{ 
              color: theme.accent, 
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '0.5rem 1rem',
              border: `2px solid ${theme.accent}`,
              borderRadius: '8px',
              display: 'inline-block'
            }}
          >
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </>
  );
}
