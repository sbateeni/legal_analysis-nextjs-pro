import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useTheme } from '../contexts/ThemeContext';

type Resource = {
  category: 'database' | 'gov';
  title: string;
  description: string;
  links: Array<{ label: string; url: string }>;
};

const RESOURCES: Resource[] = [
  {
    category: 'database',
    title: 'المقتفي - منظومة القضاء والتشريع',
    description:
      'قاعدة بيانات قانونية شاملة تابعة لجامعة بيرزيت. تعتبر المرجع الأهم للوصول للتشريعات الفلسطينية منذ فترة الانتداب البريطاني وحتى اليوم.',
    links: [{ label: 'زيارة الموقع', url: 'http://muqtafi.birzeit.edu' }],
  },
  {
    category: 'database',
    title: 'ديوان الجريدة الرسمية (الوقائع الفلسطينية)',
    description:
      'الجهة الرسمية لنشر القوانين والقرارات الرئاسية والأنظمة. يتم توفير أرشيف الجريدة الرسمية عبر موقع "المقتفي".',
    links: [{ label: 'تصفح الأرشيف', url: 'http://muqtafi.birzeit.edu/pg/' }],
  },
  {
    category: 'database',
    title: 'مقام - موسوعة القوانين والأحكام',
    description:
      'موسوعة إلكترونية مقدمة من جامعة النجاح الوطنية، توفر وصولاً سهلاً للتشريعات السارية والأحكام القضائية الحديثة.',
    links: [{ label: 'زيارة الموسوعة', url: 'https://maqam.najah.edu' }],
  },
  {
    category: 'gov',
    title: 'وزارة العدل الفلسطينية',
    description:
      'الموقع الرسمي للوزارة، يحتوي على أخبار ومشاريع القوانين ومنصة الاستشارات الإلكترونية لطرح مسودات التشريعات للنقاش العام.',
    links: [
      { label: 'الموقع الرئيسي', url: 'https://www.moj.pna.ps' },
      { label: 'منصة التشريع', url: 'https://econsultation.moj.pna.ps' },
    ],
  },
  {
    category: 'gov',
    title: 'مجلس القضاء الأعلى',
    description:
      'يمثل السلطة القضائية في فلسطين. يوفر الموقع معلومات عن المحاكم وهيكلية القضاء وبعض الخدمات الإلكترونية.',
    links: [
      { label: 'الضفة الغربية', url: 'https://www.courts.gov.ps' },
      { label: 'قطاع غزة', url: 'https://www.hjc.gov.ps' },
    ],
  },
  {
    category: 'gov',
    title: 'المجلس التشريعي الفلسطيني',
    description:
      'الموقع الرسمي للسلطة التشريعية. يحتوي على أرشيف للقوانين التي أقرها المجلس ونظامه الداخلي على الرغم من تعطل عمله حالياً.',
    links: [{ label: 'زيارة الموقع', url: 'http://www.pal-plc.org/arabic/index.html' }],
  },
  {
    category: 'gov',
    title: 'مركز المعلومات الوطني - وفا',
    description:
      'وكالة الأنباء والمعلومات الرسمية. يحتوي قسم "معلومات" على بيانات حول مؤسسات الدولة، بما في ذلك ملخصات عن القوانين والمراسيم.',
    links: [{ label: 'زيارة المركز', url: 'https://info.wafa.ps' }],
  },
];

export default function LegalResourcesPage() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'database' | 'gov'>('all');

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => (filter === 'all' ? true : r.category === filter));
  }, [filter]);

  useEffect(() => {
    // no-op: placeholder for future analytics
  }, []);

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', background: theme.background, color: theme.text, fontFamily: 'Tajawal, Arial, sans-serif' }}>
      <Head>
        <title>الدليل التفاعلي لمصادر القانون الفلسطيني</title>
        <meta name="description" content="أهم قواعد البيانات والمواقع الحكومية الرسمية للقوانين والأحكام الفلسطينية" />
      </Head>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <header style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: theme.accent }}>الدليل التفاعلي لمصادر القانون الفلسطيني</h1>
          <p style={{ marginTop: 8, fontSize: 16, opacity: 0.9 }}>
            مساحة واحدة لاستكشاف أهم قواعد البيانات والمواقع الحكومية الرسمية المتخصصة في القوانين والتشريعات والأحكام القضائية في فلسطين.
          </p>
        </header>

        <nav style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { id: 'all', label: 'عرض الكل' },
            { id: 'database', label: 'قواعد بيانات أساسية' },
            { id: 'gov', label: 'مواقع حكومية رسمية' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setFilter(b.id as 'all' | 'database' | 'gov')}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: filter === (b.id as any) ? theme.accent : '#fff',
                color: filter === (b.id as any) ? '#fff' : theme.text,
                border: `1px solid ${theme.border}`,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {b.label}
            </button>
          ))}
        </nav>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((res, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: 16,
                boxShadow: `0 2px 10px ${theme.shadow}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: theme.accent, marginBottom: 8 }}>{res.title}</h3>
                <p style={{ opacity: 0.9, lineHeight: 1.7 }}>{res.description}</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}` }}>
                {res.links.map((lnk, i) => (
                  <a
                    key={i}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: theme.accent2,
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}


