import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useTheme } from '../contexts/ThemeContext';

type Resource = {
  category: 'database' | 'gov' | 'laws' | 'recent';
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
    links: [
      { label: 'زيارة الموقع', url: 'http://muqtafi.birzeit.edu' },
      { label: 'البحث المتقدم', url: 'http://muqtafi.birzeit.edu/pg/' }
    ],
  },
  {
    category: 'database',
    title: 'ديوان الجريدة الرسمية (الوقائع الفلسطينية)',
    description:
      'الجهة الرسمية لنشر القوانين والقرارات الرئاسية والأنظمة. يتم توفير أرشيف الجريدة الرسمية عبر موقع "المقتفي".',
    links: [
      { label: 'تصفح الأرشيف', url: 'http://muqtafi.birzeit.edu/pg/' },
      { label: 'الأعداد الحديثة', url: 'http://muqtafi.birzeit.edu/pg/' },
      { label: 'البحث في الجريدة الرسمية', url: 'http://muqtafi.birzeit.edu/pg/' }
    ],
  },
  {
    category: 'database',
    title: 'مقام - موسوعة القوانين والأحكام',
    description:
      'موسوعة إلكترونية مقدمة من جامعة النجاح الوطنية، توفر وصولاً سهلاً للتشريعات السارية والأحكام القضائية الحديثة.',
    links: [
      { label: 'زيارة الموسوعة', url: 'https://maqam.najah.edu' },
      { label: 'قانون العقوبات رقم 16/1960', url: 'https://maqam.najah.edu/legislation/33/' },
      { label: 'التشريعات', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'الأحكام القضائية', url: 'https://maqam.najah.edu/judgments/' }
    ],
  },
  {
    category: 'database',
    title: 'مقام - البحث في التشريعات',
    description:
      'صفحة البحث المتقدم في قاعدة بيانات التشريعات الفلسطينية. تتيح البحث في جميع القوانين والقرارات والأنظمة.',
    links: [
      { label: 'البحث في التشريعات', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'آخر التشريعات', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'التصنيف الموضوعي', url: 'https://maqam.najah.edu/legislation/' }
    ],
  },
  {
    category: 'database',
    title: 'مقام - مجلة الوقائع الفلسطينية',
    description:
      'صفحة مجلة الوقائع الفلسطينية الرسمية. تحتوي على أرشيف كامل للأعداد المنشورة مع إمكانية البحث المتقدم.',
    links: [
      { label: 'مجلة الوقائع الفلسطينية', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'آخر الأعداد المنشورة', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'البحث في المجلة', url: 'https://maqam.najah.edu/official-gazette/' }
    ],
  },
  {
    category: 'database',
    title: 'مقام - أبحاث ومقالات قانونية',
    description:
      'صفحة الأبحاث والمقالات القانونية. تحتوي على دراسات وأبحاث أكاديمية في مختلف فروع القانون الفلسطيني.',
    links: [
      { label: 'الأبحاث والمقالات', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'دراسات قانونية', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'مقالات أكاديمية', url: 'https://maqam.najah.edu/blog/articles/' }
    ],
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
  {
    category: 'database',
    title: 'المحكمة الدستورية العليا',
    description:
      'المرجع الأعلى للرقابة على دستورية القوانين والأنظمة. توفر الموقع قراراتها الدستورية والآراء الاستشارية.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.constitutionalcourt.ps' },
      { label: 'القرارات الدستورية', url: 'https://www.constitutionalcourt.ps/decisions' }
    ],
  },
  {
    category: 'gov',
    title: 'النيابة العامة الفلسطينية',
    description:
      'الجهاز المسؤول عن التحقيق والملاحقة القضائية. يوفر الموقع معلومات عن الإجراءات القانونية والخدمات الإلكترونية.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.pp.ps' },
      { label: 'الخدمات الإلكترونية', url: 'https://www.pp.ps/services' }
    ],
  },
  {
    category: 'gov',
    title: 'هيئة مكافحة الفساد',
    description:
      'الجهاز المسؤول عن مكافحة الفساد والشفافية. يوفر الموقع تقاريرها السنوية وقراراتها في قضايا الفساد.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.anticorruption.ps' },
      { label: 'التقارير السنوية', url: 'https://www.anticorruption.ps/reports' }
    ],
  },
  {
    category: 'database',
    title: 'المعهد القضائي الفلسطيني',
    description:
      'المعهد المسؤول عن تدريب القضاة والمحامين. يوفر الموقع برامج التدريب والمواد التعليمية القانونية.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.ji.ps' },
      { label: 'برامج التدريب', url: 'https://www.ji.ps/training' }
    ],
  },
  {
    category: 'gov',
    title: 'وزارة العمل الفلسطينية',
    description:
      'الوزارة المسؤولة عن قوانين العمل وحقوق العمال. يوفر الموقع قوانين العمل واللوائح التنفيذية.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.mol.pna.ps' },
      { label: 'قوانين العمل', url: 'https://www.mol.pna.ps/laws' }
    ],
  },
  {
    category: 'database',
    title: 'الجهاز المركزي للإحصاء الفلسطيني',
    description:
      'الجهاز المسؤول عن الإحصائيات الرسمية. يوفر الموقع البيانات الإحصائية والتقارير الرسمية.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.pcbs.gov.ps' },
      { label: 'قاعدة البيانات', url: 'https://www.pcbs.gov.ps/database' }
    ],
  },
  {
    category: 'gov',
    title: 'سلطة الأراضي الفلسطينية',
    description:
      'السلطة المسؤولة عن إدارة الأراضي والعقارات. يوفر الموقع قوانين الأراضي والخدمات العقارية.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.land.pna.ps' },
      { label: 'قوانين الأراضي', url: 'https://www.land.pna.ps/laws' }
    ],
  },
  {
    category: 'database',
    title: 'موسوعة ودق القانونية',
    description:
      'موسوعة قانونية شاملة تقدم خدمات البحث القانوني والاستشارات. تحتوي على قاعدة بيانات واسعة من القوانين والأحكام.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.wadq.ps' },
      { label: 'البحث القانوني', url: 'https://www.wadq.ps/search' }
    ],
  },
  {
    category: 'database',
    title: 'المركز الفلسطيني للسلام والديمقراطية',
    description:
      'مركز أبحاث يهتم بالقانون الدولي وحقوق الإنسان. يوفر الموقع أبحاثاً ودراسات في القانون الدولي.',
    links: [
      { label: 'الموقع الرسمي', url: 'https://www.pcpd.ps' },
      { label: 'الأبحاث والدراسات', url: 'https://www.pcpd.ps/research' }
    ],
  },
  {
    category: 'laws',
    title: 'قانون العقوبات رقم (16) لسنة 1960م',
    description:
      'القانون الأساسي للعقوبات في فلسطين. يتضمن جميع الجرائم والعقوبات المقررة لها، وهو المرجع الأساسي في القانون الجنائي.',
    links: [
      { label: 'عرض القانون كاملاً', url: 'https://maqam.najah.edu/legislation/33/' },
      { label: 'البحث في المواد', url: 'https://maqam.najah.edu/legislation/33/' },
      { label: 'الأحكام القضائية المتعلقة', url: 'https://maqam.najah.edu/judgments/' }
    ],
  },
  {
    category: 'laws',
    title: 'قانون الإجراءات المدنية والتجارية',
    description:
      'القانون المنظم للإجراءات في المحاكم المدنية والتجارية. يحدد القواعد والإجراءات المتبعة في التقاضي المدني.',
    links: [
      { label: 'عرض القانون', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'الإجراءات المدنية', url: 'https://maqam.najah.edu/legislation/' }
    ],
  },
  {
    category: 'laws',
    title: 'قانون العمل الفلسطيني',
    description:
      'القانون المنظم لعلاقات العمل وحقوق العمال وأصحاب العمل. يتضمن أحكام عقود العمل والأجور والإجازات.',
    links: [
      { label: 'عرض القانون', url: 'https://www.mol.pna.ps/laws' },
      { label: 'حقوق العمال', url: 'https://www.mol.pna.ps/workers-rights' }
    ],
  },
  {
    category: 'laws',
    title: 'قانون الأحوال الشخصية',
    description:
      'القانون المنظم للزواج والطلاق والميراث والوصية. يطبق على المسلمين في فلسطين ويستند إلى الشريعة الإسلامية.',
    links: [
      { label: 'عرض القانون', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'الأحكام القضائية', url: 'https://maqam.najah.edu/judgments/' }
    ],
  },
  {
    category: 'laws',
    title: 'قانون الملكية العقارية',
    description:
      'القانون المنظم لحقوق الملكية العقارية وتسجيل الأراضي والعقارات. يتضمن أحكام التسجيل والحيازة والتصرف.',
    links: [
      { label: 'عرض القانون', url: 'https://www.land.pna.ps/laws' },
      { label: 'خدمات التسجيل', url: 'https://www.land.pna.ps/services' }
    ],
  },
  {
    category: 'recent',
    title: 'أحدث التشريعات 2025 - قرارات رئاسية',
    description:
      'أحدث القرارات الرئاسية الصادرة في عام 2025، تشمل قرارات تسمية لجان الدستور والاستملاك وتعيين القضاة.',
    links: [
      { label: 'قرار رقم (73) - لجنة صياغة الدستور', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار رقم (69) - استملاك أراضي رام الله', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار رقم (65) - تعيين قضاة شرعيين', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار رقم (47) - مؤسسة المواصفات', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار رقم (37) - استملاك أراضي طوباس', url: 'https://maqam.najah.edu/legislation/' }
    ],
  },
  {
    category: 'recent',
    title: 'أحدث التشريعات 2025 - قرارات بقانون',
    description:
      'أحدث القرارات بقانون الصادرة في عام 2025، تشمل حوكمة المؤسسات وتعديلات القوانين والاتفاقيات الدولية.',
    links: [
      { label: 'قرار بقانون (19) - حوكمة المؤسسات', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (18) - تعديل قانون المخابرات', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (17) - المحافظة على أراضي الدولة', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (16) - تعديل قانون المطبوعات', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (15) - منح الثقة للوزراء', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (14) - اتفاقية نقل البضائع', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (13) - اتفاقية البنك الإسلامي', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (12) - نقابة أطباء الأسنان', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (11) - قانون المنافسة', url: 'https://maqam.najah.edu/legislation/' },
      { label: 'قرار بقانون (9) - تقاعد ضباط الأمن', url: 'https://maqam.najah.edu/legislation/' }
    ],
  },
  {
    category: 'recent',
    title: 'أحدث الأحكام القضائية 2025 - محكمة النقض',
    description:
      'أحدث الأحكام الصادرة عن محكمة النقض الفلسطينية في عام 2025، تشمل الطعون الجزائية والحقوقية.',
    links: [
      { label: 'القضية رقم 139/2025 - طعون جزائية', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'القضية رقم 283/2025 - طعون جزائية', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'القضية رقم 160/2025 - طعون جزائية', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'القضية رقم 181/2025 - طعون جزائية', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'القضية رقم 161/2025 - طعون جزائية', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'القضية رقم 182/2025 - طعون جزائية', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'القضية رقم 392/2024 - طعون حقوقية', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'القضية رقم 35/2025 - طعون جزائية', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'القضية رقم 141/2025 - طعون جزائية', url: 'https://maqam.najah.edu/judgments/' }
    ],
  },
  {
    category: 'recent',
    title: 'أحدث الأحكام القضائية 2025 - المحكمة الدستورية',
    description:
      'أحدث الأحكام الصادرة عن المحكمة الدستورية العليا الفلسطينية في عام 2025، تشمل قضايا التنازع والرقابة الدستورية.',
    links: [
      { label: 'القضية رقم 1/2025 - تنازع تنفيذ', url: 'https://maqam.najah.edu/judgments/' },
      { label: 'جميع أحكام المحكمة الدستورية', url: 'https://maqam.najah.edu/judgments/' }
    ],
  },
  {
    category: 'recent',
    title: 'مجلة الوقائع الفلسطينية - الأعداد الحديثة',
    description:
      'أحدث أعداد مجلة الوقائع الفلسطينية الرسمية التي تنشر القوانين والقرارات الرئاسية والأنظمة.',
    links: [
      { label: 'العدد 229 - أحدث عدد', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 228', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 227', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 226', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 225', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 224', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 223', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 222', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 30 - عدد ممتاز', url: 'https://maqam.najah.edu/official-gazette/' },
      { label: 'العدد 29 - عدد ممتاز', url: 'https://maqam.najah.edu/official-gazette/' }
    ],
  },
  {
    category: 'recent',
    title: 'أبحاث ومقالات قانونية حديثة - مقام',
    description:
      'أحدث الأبحاث والمقالات القانونية المنشورة في موقع مقام. تشمل دراسات في مختلف فروع القانون الفلسطيني.',
    links: [
      { label: 'القيم الثقافية في إعلانات التأمين', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'قوانين حماية الأسرة والمساواة', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'الطبيعة القانونية للدفع بالتحكيم', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'مبادئ الهيئة العامة للمحكمة العليا', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'التحديات القانونية للتنمية المستدامة', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'نظام إدارة الدعوى الإلكتروني', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'الوساطة في حماية الأحداث', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'حماية المرأة العاملة', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'الاعتقال الإداري والمعايير الدولية', url: 'https://maqam.najah.edu/blog/articles/' },
      { label: 'المساعدة القانونية والعدالة الاجتماعية', url: 'https://maqam.najah.edu/blog/articles/' }
    ],
  },
];

export default function LegalResourcesPage() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'database' | 'gov' | 'laws' | 'recent'>('all');

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
            { id: 'laws', label: 'قوانين محددة' },
            { id: 'recent', label: 'أحدث التشريعات والأحكام' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setFilter(b.id as 'all' | 'database' | 'gov' | 'laws' | 'recent')}
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


