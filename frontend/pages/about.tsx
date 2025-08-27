import React from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { isMobile } from '../utils/crypto';

const stages = [
  'تحديد المشكلة القانونية',
  'جمع المعلومات والوثائق',
  'تحليل النصوص القانونية',
  'تحديد القواعد القانونية المنطبقة',
  'تحليل السوابق القضائية',
  'تحليل الفقه القانوني',
  'تحليل الظروف الواقعية',
  'تحديد الحلول القانونية الممكنة',
  'تقييم الحلول القانونية',
  'اختيار الحل الأمثل',
  'صياغة الحل القانوني',
  'تقديم التوصيات',
  'العريضة القانونية النهائية',
];

export default function About() {
  const { theme, darkMode } = useTheme();

  return (
    <div style={{ fontFamily: 'Tajawal, Arial, sans-serif', direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text, padding: 0, margin: 0 }}>
      <main className="container" style={{ maxWidth: 800, padding: isMobile() ? '1rem 0.5rem' : '2.5rem 1rem' }}>
        <div className="fade-in-up card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile() ? 20 : 36, marginBottom: isMobile() ? 20 : 32 }}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap: isMobile() ? 8 : 10, marginBottom: isMobile() ? 14 : 18}}>
            <span style={{fontSize: isMobile() ? 28 : 36}}>⚖️</span>
            <h1 className="headline-lg font-headline" style={{ color: theme.accent, margin: 0 }}>عن المنصة</h1>
          </div>
          <p className="font-body" style={{ fontSize: isMobile() ? 16 : 19, marginBottom: isMobile() ? 18 : 22, lineHeight: 1.8, textAlign:'center' }}>
            <b>منصة التحليل القانوني الذكي</b> هي أداة متقدمة تساعدك على تحليل النصوص القانونية العربية بدقة واحترافية، عبر 13 مرحلة تحليلية متكاملة تغطي جميع الجوانب القانونية، مع دعم التحليل التراكمي المتسلسل (كل مرحلة تعتمد على نتائج السابقة حتى الوصول للعريضة النهائية).
          </p>
        </div>

        {/* الميزات الرئيسية */}
        <div className="fade-in-up card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile() ? 20 : 24, marginBottom: isMobile() ? 20 : 24 }}>
          <div style={{margin: isMobile() ? '0 0 16px 0' : '0 0 20px 0', display:'flex', alignItems:'center', gap: isMobile() ? 6 : 8}}>
            <span style={{fontSize: isMobile() ? 18 : 22}}>🚀</span>
            <h2 className="headline-sm font-headline" style={{ color: theme.accent2, margin: 0 }}>الميزات الرئيسية:</h2>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: isMobile() ? '1fr' : '1fr 1fr', gap: isMobile() ? 12 : 16}}>
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 20}}>🔍</span>
                <h3 style={{margin: 0, fontSize: isMobile() ? 16 : 18, color: theme.accent}}>تحليل قانوني متقدم</h3>
              </div>
              <p style={{margin: 0, fontSize: isMobile() ? 13 : 14, lineHeight: 1.6}}>13 مرحلة تحليل متسلسلة ومتراكمة تغطي جميع الجوانب القانونية</p>
            </div>
            
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 20}}>🤖</span>
                <h3 style={{margin: 0, fontSize: isMobile() ? 16 : 18, color: theme.accent}}>مساعد قانوني فلسطيني</h3>
              </div>
              <p style={{margin: 0, fontSize: isMobile() ? 13 : 14, lineHeight: 1.6}}>محادثة تفاعلية متخصصة في الإطار القانوني الفلسطيني</p>
            </div>
            
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 20}}>📊</span>
                <h3 style={{margin: 0, fontSize: isMobile() ? 16 : 18, color: theme.accent}}>تحليلات وإحصائيات</h3>
              </div>
              <p style={{margin: 0, fontSize: isMobile() ? 13 : 14, lineHeight: 1.6}}>إحصائيات مفصلة عن القضايا والاستخدام مع رسوم بيانية</p>
            </div>
            
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 20}}>📱</span>
                <h3 style={{margin: 0, fontSize: isMobile() ? 16 : 18, color: theme.accent}}>تطبيق ويب تقدمي (PWA)</h3>
              </div>
              <p style={{margin: 0, fontSize: isMobile() ? 13 : 14, lineHeight: 1.6}}>يمكن تثبيته كتطبيق على الهاتف ويعمل بدون إنترنت</p>
            </div>
            
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 20}}>💾</span>
                <h3 style={{margin: 0, fontSize: isMobile() ? 16 : 18, color: theme.accent}}>قاعدة معرفة قانونية</h3>
              </div>
              <p style={{margin: 0, fontSize: isMobile() ? 13 : 14, lineHeight: 1.6}}>حفظ الاستراتيجيات القانونية وإعادة استخدامها</p>
            </div>
            
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
                <span style={{fontSize: 20}}>🔒</span>
                <h3 style={{margin: 0, fontSize: isMobile() ? 16 : 18, color: theme.accent}}>حماية الخصوصية</h3>
              </div>
              <p style={{margin: 0, fontSize: isMobile() ? 13 : 14, lineHeight: 1.6}}>جميع البيانات محفوظة محلياً مع تشفير متقدم</p>
            </div>
          </div>
        </div>

        <div style={{margin: isMobile() ? '24px 0 14px 0' : '32px 0 18px 0', display:'flex', alignItems:'center', gap: isMobile() ? 6 : 8}}>
          <span style={{fontSize: isMobile() ? 18 : 22}}>🛠️</span>
          <h2 className="headline-sm font-headline" style={{ color: theme.accent2, margin: 0 }}>طريقة الاستخدام:</h2>
        </div>
        <ol className="font-body" style={{ fontSize: isMobile() ? 15 : 17, marginBottom: isMobile() ? 14 : 18, lineHeight: 1.8, paddingRight: isMobile() ? 16 : 24, background: darkMode ? '#181a2a' : '#f5f7ff', borderRadius: isMobile() ? 10 : 12, padding: isMobile() ? '14px 14px 14px 6px' : '18px 18px 18px 8px', borderColor: theme.border, borderStyle: 'solid', borderWidth: 1 }}>
          <li>احصل على مفتاح Gemini API الخاص بك من <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{color:theme.accent, textDecoration:'underline'}}>Google AI Studio</a>.</li>
          <li>أدخل المفتاح في خانة "مفتاح Gemini API" في الصفحة الرئيسية.</li>
          <li>أدخل النص القانوني الذي ترغب في تحليله واسم القضية (اختياري).</li>
          <li>اختر المرحلة التحليلية المناسبة أو اتبع التسلسل التراكمي.</li>
          <li>اضغط على "ابدأ التحليل" وستظهر لك النتيجة خلال ثوانٍ.</li>
          <li>يمكنك حفظ القضية، تصديرها أو استيرادها لاحقًا.</li>
          <li>استخدم المساعد القانوني الفلسطيني لأسئلة قانونية محددة.</li>
          <li>راجع التحليلات والإحصائيات من صفحة التحليلات.</li>
        </ol>

        <div className="fade-in-up" style={{margin: isMobile() ? '24px 0 14px 0' : '32px 0 18px 0', display:'flex', alignItems:'center', gap: isMobile() ? 6 : 8}}>
          <span style={{fontSize: isMobile() ? 18 : 22}}>📋</span>
          <h2 className="headline-sm font-headline" style={{ color: theme.accent2, margin: 0 }}>مراحل التحليل القانوني:</h2>
        </div>
        <ul className="font-body" style={{ fontSize: isMobile() ? 15 : 17, marginBottom: isMobile() ? 14 : 18, lineHeight: 1.8, paddingRight: isMobile() ? 16 : 24, background: darkMode ? '#181a2a' : '#f5f7ff', borderRadius: isMobile() ? 10 : 12, padding: isMobile() ? '14px 14px 14px 6px' : '18px 18px 18px 8px', borderColor: theme.border, borderStyle: 'solid', borderWidth: 1 }}>
          {stages.map((stage, i) => (
            <li key={i} style={{marginBottom: isMobile() ? 3 : 4}}><b>{i+1}.</b> {stage}</li>
          ))}
        </ul>

        {/* الميزات المتقدمة */}
        <div className="fade-in-up card-ui" style={{ background: theme.card, borderColor: theme.border, padding: isMobile() ? 20 : 24, marginBottom: isMobile() ? 20 : 24 }}>
          <div style={{margin: isMobile() ? '0 0 16px 0' : '0 0 20px 0', display:'flex', alignItems:'center', gap: isMobile() ? 6 : 8}}>
            <span style={{fontSize: isMobile() ? 18 : 22}}>⚡</span>
            <h2 className="headline-sm font-headline" style={{ color: theme.accent2, margin: 0 }}>الميزات المتقدمة:</h2>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: isMobile() ? '1fr' : '1fr 1fr', gap: isMobile() ? 12 : 16}}>
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <h4 style={{margin: '0 0 8px 0', color: theme.accent, fontSize: isMobile() ? 14 : 16}}>المساعد القانوني الفلسطيني</h4>
              <ul style={{margin: 0, paddingRight: 16, fontSize: isMobile() ? 12 : 13}}>
                <li>محادثة تفاعلية ذكية</li>
                <li>اقتراحات وخطوات تالية</li>
                <li>مستوى ثقة للإجابات</li>
                <li>حفظ الاستراتيجيات</li>
              </ul>
            </div>
            
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <h4 style={{margin: '0 0 8px 0', color: theme.accent, fontSize: isMobile() ? 14 : 16}}>نظام التحليلات</h4>
              <ul style={{margin: 0, paddingRight: 16, fontSize: isMobile() ? 12 : 13}}>
                <li>إحصائيات مفصلة للقضايا</li>
                <li>تحليل أنواع القضايا</li>
                <li>معدل الإنجاز</li>
                <li>النشاط الأخير</li>
              </ul>
            </div>
            
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <h4 style={{margin: '0 0 8px 0', color: theme.accent, fontSize: isMobile() ? 14 : 16}}>قاعدة المعرفة القانونية</h4>
              <ul style={{margin: 0, paddingRight: 16, fontSize: isMobile() ? 12 : 13}}>
                <li>حفظ الاستراتيجيات</li>
                <li>إعادة استخدام الحلول</li>
                <li>تصنيف بالموضوعات</li>
                <li>البحث والتصفية</li>
              </ul>
            </div>
            
            <div style={{background: darkMode ? '#1e1e2e' : '#f8fafc', padding: isMobile() ? 12 : 16, borderRadius: 8, border: `1px solid ${theme.border}`}}>
              <h4 style={{margin: '0 0 8px 0', color: theme.accent, fontSize: isMobile() ? 14 : 16}}>التطبيق التقدمي (PWA)</h4>
              <ul style={{margin: 0, paddingRight: 16, fontSize: isMobile() ? 12 : 13}}>
                <li>تثبيت كتطبيق</li>
                <li>عمل بدون إنترنت</li>
                <li>إشعارات ذكية</li>
                <li>تجربة محسنة</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="fade-in-up" style={{margin: isMobile() ? '24px 0 14px 0' : '32px 0 18px 0', display:'flex', alignItems:'center', gap: isMobile() ? 6 : 8}}>
          <span style={{fontSize: isMobile() ? 18 : 22}}>💡</span>
          <h2 className="headline-sm font-headline" style={{ color: theme.accent2, margin: 0 }}>ملاحظات هامة:</h2>
        </div>
        <ul className="font-body" style={{ fontSize: isMobile() ? 14 : 16, marginBottom: 0, lineHeight: 1.8, paddingRight: isMobile() ? 16 : 24, background: darkMode ? '#181a2a' : '#f5f7ff', borderRadius: isMobile() ? 10 : 12, padding: isMobile() ? '14px 14px 14px 6px' : '18px 18px 18px 8px', border: `1px solid ${theme.border}` }}>
          <li>المنصة مجانية حاليًا، وقد تصبح باشتراك لاحقًا.</li>
          <li>كل مستخدم يحتاج لمفتاح Gemini API خاص به (لا تشارك مفتاحك مع الآخرين).</li>
          <li>النتائج تعتمد على دقة النص المدخل وصحة المفتاح.</li>
          <li>لا نخزن نصوصك أو مفاتيحك على خوادمنا؛ قد تمر الطلبات عبر دالة خادم لمعالجتها ثم تُرسل إلى خدمات Google AI ولا تُخزن لدينا.</li>
          <li>جميع القضايا والمفاتيح تحفظ محليًا على جهازك فقط باستخدام قاعدة بيانات المتصفح (IndexedDB)، مع إمكانية تصدير واستيراد القضايا.</li>
          <li>واجهة متجاوبة بالكامل تدعم الوضع الليلي، الخطوط العربية، وRTL.</li>
          <li>يوجد زر لمسح كل البيانات، ومؤشرات تحميل وتنبيهات ذكية.</li>
          <li>المساعد القانوني متخصص في الإطار القانوني الفلسطيني فقط.</li>
          <li>يمكن حفظ المحادثات والاستراتيجيات في قاعدة المعرفة القانونية.</li>
        </ul>
        
        <div className="text-center" style={{ color: theme.accent2, fontSize: isMobile() ? 14 : 16, marginTop: isMobile() ? 14 : 18 }}>
          &larr; <Link href="/" style={{color:theme.accent, textDecoration:'underline', fontWeight:700}}>العودة للصفحة الرئيسية</Link>
        </div>
        
        <div className="badge" style={{marginTop: isMobile() ? 20 : 32, background:'#fffbe6', color:'#b7791f', borderRadius: isMobile() ? 6 : 8, padding: isMobile() ? '8px 14px' : '10px 18px', display:'inline-block', fontWeight:700, fontSize: isMobile() ? 12 : 14, boxShadow:'0 1px 4px #b7791f22'}}>
          ⚠️ جميع بياناتك (القضايا والمفاتيح) تحفظ محليًا على جهازك فقط ولا يتم رفعها إلى أي خادم.
        </div>
        
        <div style={{marginTop: isMobile() ? 18 : 24, textAlign:'center'}}>
          <Link href="/privacy" style={{color:theme.accent, textDecoration:'underline', fontWeight:700, fontSize: isMobile() ? 13 : 15}}>سياسة الخصوصية</Link>
        </div>
        
        <div className="card-panel" style={{marginTop: isMobile() ? 24 : 36, background:'#e0e7ff', color:'#222', borderRadius: isMobile() ? 8 : 10, padding: isMobile() ? '14px 14px' : '18px 18px', fontWeight:700, fontSize: isMobile() ? 13 : 15, boxShadow:'0 1px 4px #4f46e522', lineHeight: 1.8, borderColor: '#e0e7ff'}}>
          <span style={{color:theme.accent, fontSize: isMobile() ? 16 : 18}}>🔒 ملاحظات حول الأمان والتخزين على Vercel:</span><br/>
          جميع عمليات الحفظ تتم <b>محليًا في متصفحك فقط</b> باستخدام قاعدة بيانات المتصفح (IndexedDB)، ولا يتم إرسال أي بيانات إلى خوادم Vercel أو أي طرف خارجي.<br/>
          <span style={{color:'#b7791f'}}>إذا فتحت الموقع من جهاز أو متصفح جديد، لن تجد بياناتك القديمة لأنها محفوظة محليًا فقط.</span><br/>
          إذا قمت بمسح بيانات المتصفح (Clear Site Data)، ستُحذف القضايا والمفاتيح نهائيًا.<br/>
          <span style={{color:theme.accent2}}>للحفاظ على بياناتك أو نقلها لجهاز آخر، استخدم ميزة تصدير/استيراد القضايا من واجهة الموقع.</span>
        </div>
      </main>
    </div>
  );
} 