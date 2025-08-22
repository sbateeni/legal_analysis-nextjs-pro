import React from 'react';
import Link from 'next/link';
import { isMobile } from '../utils/crypto';
import { useTheme } from '../contexts/ThemeContext';

export default function Privacy() {
  const { theme } = useTheme();
  return (
    <div style={{fontFamily:'Tajawal, Arial, sans-serif', direction:'rtl', minHeight:'100vh', background: theme.background, color: theme.text, padding: isMobile() ? '0 0.5rem' : '0 1rem'}}>
      <main style={{maxWidth:700, margin:'0 auto', padding: isMobile() ? '1rem 0.5rem' : '2.5rem 1rem'}}>
        <h1 style={{color: theme.accent, fontWeight:900, fontSize: isMobile() ? 24 : 32, marginBottom: isMobile() ? 14 : 18, letterSpacing:1}}>سياسة الخصوصية</h1>
        <p style={{fontSize: isMobile() ? 16 : 18, lineHeight: 1.8, marginBottom: isMobile() ? 18 : 24}}>
          نحن في <b>منصة التحليل القانوني الذكي</b> نولي خصوصيتك أهمية قصوى. جميع بياناتك (القضايا، التحليلات، مفاتيح Gemini API) تحفظ محليًا على جهازك فقط باستخدام <b>قاعدة بيانات المتصفح (IndexedDB)</b> ولا يتم رفعها أو مشاركتها مع أي خادم أو طرف ثالث.
        </p>
        <ul style={{fontSize: isMobile() ? 14 : 16, marginBottom: isMobile() ? 18 : 24, lineHeight: 1.8, paddingRight: isMobile() ? 16 : 24, background: theme.card, borderRadius: isMobile() ? 10 : 12, padding: isMobile() ? '14px 14px 14px 6px' : '18px 18px 18px 8px', border:`1px solid ${theme.border}`}}>
          <li>لا نقوم بجمع أو تخزين أي بيانات شخصية على خوادمنا.</li>
          <li>لا نخزن نصوصك أو مفاتيحك على خوادمنا؛ قد تمر الطلبات عبر دالة خادم لمعالجتها ثم تُرسل إلى خدمات Google AI ولا تُخزن لدينا.</li>
          <li>يمكنك في أي وقت مسح جميع بياناتك من خلال زر &quot;مسح كل البيانات&quot; في الموقع.</li>
        </ul>
        <div style={{marginTop: isMobile() ? 24 : 32, textAlign:'center'}}>
          <Link href="/" style={{color: theme.accent, textDecoration:'underline', fontWeight:700, fontSize: isMobile() ? 14 : 16}}>العودة للصفحة الرئيسية</Link>
        </div>
      </main>
    </div>
  );
} 