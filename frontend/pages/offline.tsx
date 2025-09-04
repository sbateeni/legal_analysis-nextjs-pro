import Head from 'next/head';

export default function OfflinePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <Head>
        <title>أنت خارج الاتصال</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>🚧 لا يوجد اتصال بالإنترنت</h1>
        <p style={{ marginBottom: 16 }}>يمكنك متابعة تصفح البيانات المحفوظة مسبقاً. ستعود المزامنة تلقائياً عند عودة الاتصال.</p>
        <a href="/" style={{ color: '#111', textDecoration: 'underline' }}>العودة إلى الصفحة الرئيسية</a>
      </div>
    </div>
  );
}


