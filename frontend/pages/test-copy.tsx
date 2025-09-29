import React from 'react';
import Head from 'next/head';

/**
 * صفحة اختبار وظيفة النسخ
 * Test page for copy functionality
 */
export default function TestCopyPage() {
  return (
    <>
      <Head>
        <title>اختبار وظيفة النسخ - Test Copy Functionality</title>
        <meta name="description" content="صفحة اختبار وظيفة تحديد النص والنسخ" />
      </Head>
      
      <div style={{ 
        padding: '2rem', 
        maxWidth: '800px', 
        margin: '0 auto',
        fontFamily: 'Tajawal, Arial, sans-serif',
        direction: 'rtl'
      }}>
        <h1 style={{ 
          color: '#3b82f6', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          اختبار وظيفة النسخ
        </h1>
        
        <div style={{ 
          background: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>
            نص للاختبار - Test Text
          </h2>
          <p style={{ 
            lineHeight: '1.8', 
            color: '#475569',
            fontSize: '16px'
          }}>
            هذا نص تجريبي لاختبار وظيفة تحديد النص والنسخ. يجب أن تكون قادراً على تحديد هذا النص 
            ونسخه باستخدام الماوس أو لوحة المفاتيح. جرب تحديد النص بالماوس أو باستخدام Ctrl+A 
            ثم Ctrl+C للنسخ.
          </p>
          <p style={{ 
            lineHeight: '1.8', 
            color: '#475569',
            fontSize: '16px',
            marginTop: '1rem'
          }}>
            This is test text to verify the copy functionality. You should be able to select this text 
            and copy it using your mouse or keyboard. Try selecting the text with your mouse or using 
            Ctrl+A then Ctrl+C to copy.
          </p>
        </div>

        <div style={{ 
          background: '#fef3c7', 
          padding: '1.5rem', 
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid #f59e0b'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '1rem' }}>
            تعليمات الاختبار - Test Instructions
          </h3>
          <ol style={{ 
            color: '#92400e',
            lineHeight: '1.8',
            paddingRight: '1.5rem'
          }}>
            <li>جرب تحديد النص أعلاه بالماوس</li>
            <li>جرب استخدام Ctrl+A لتحديد كل النص</li>
            <li>جرب استخدام Ctrl+C لنسخ النص المحدد</li>
            <li>جرب النقر بالزر الأيمن واختيار "نسخ" من القائمة</li>
            <li>تأكد من أن النص المحدد يظهر بلون أزرق</li>
          </ol>
        </div>

        <div style={{ 
          background: '#ecfdf5', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid #10b981'
        }}>
          <h3 style={{ color: '#065f46', marginBottom: '1rem' }}>
            معلومات إضافية - Additional Info
          </h3>
          <p style={{ 
            color: '#065f46',
            lineHeight: '1.8'
          }}>
            إذا كانت وظيفة النسخ تعمل بشكل صحيح، يجب أن تكون قادراً على تحديد ونسخ أي نص في هذه الصفحة. 
            إذا لم تعمل الوظيفة، يرجى التحقق من إعدادات المتصفح أو إعادة تحميل الصفحة.
          </p>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem'
        }}>
          <a 
            href="/" 
            style={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '0.5rem 1rem',
              border: '2px solid #3b82f6',
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
