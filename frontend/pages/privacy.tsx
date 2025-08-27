import React from 'react';
import Link from 'next/link';
import { isMobile } from '../utils/crypto';
import { useTheme } from '../contexts/ThemeContext';

export default function Privacy() {
  const { theme } = useTheme();
  return (
    <div style={{fontFamily:'Tajawal, Arial, sans-serif', direction:'rtl', minHeight:'100vh', background: theme.background, color: theme.text }}>
      <main className="container" style={{maxWidth:700, padding: isMobile() ? '1rem 0.5rem' : '2.5rem 1rem'}}>
        <h1 className="section-title" style={{ color: theme.accent }}>سياسة الخصوصية</h1>
        <p style={{fontSize: isMobile() ? 16 : 18, lineHeight: 1.8}}>
          نحن في <b>منصة التحليل القانوني الذكي</b> نولي خصوصيتك أهمية قصوى. جميع بياناتك (القضايا، التحليلات، مفاتيح Gemini API) تحفظ محليًا على جهازك فقط باستخدام <b>قاعدة بيانات المتصفح (IndexedDB)</b> ولا يتم رفعها أو مشاركتها مع أي خادم أو طرف ثالث.
        </p>
        <ul className="card-panel" style={{fontSize: isMobile() ? 14 : 16, lineHeight: 1.8, paddingRight: isMobile() ? 16 : 24, background: theme.card, borderColor: theme.border, borderRadius: isMobile() ? 10 : 12, padding: isMobile() ? '14px 14px 14px 6px' : '18px 18px 18px 8px'}}>
          <li>لا نقوم بجمع أو تخزين أي بيانات شخصية على خوادمنا.</li>
          <li>لا نخزن نصوصك أو مفاتيحك على خوادمنا؛ قد تمر الطلبات عبر دالة خادم لمعالجتها ثم تُرسل إلى خدمات Google AI ولا تُخزن لدينا.</li>
          <li>يمكنك في أي وقت مسح جميع بياناتك من خلال زر &quot;مسح كل البيانات&quot; في الموقع.</li>
        </ul>
        <div className="text-center" style={{marginTop: isMobile() ? 24 : 32}}>
          <Link href="/" style={{color: theme.accent, textDecoration:'underline', fontWeight:700}}>العودة للصفحة الرئيسية</Link>
        </div>
      </main>
    </div>
  );
} 