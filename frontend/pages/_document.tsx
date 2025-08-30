import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ar" dir="rtl">
        <Head>
          <meta name="theme-color" content="#6366f1" />
          <link rel="manifest" href="/manifest.json" />
          
          {/* PWA Meta Tags for iOS */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="التحليل القانوني" />
          <meta name="mobile-web-app-capable" content="yes" />
          
          {/* Apple Touch Icons */}
          <link rel="apple-touch-icon" href="/icon-192x192.svg" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.svg" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.svg" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.svg" />
          
          {/* Safari Pinned Tab Icon */}
          <link rel="mask-icon" href="/icon-192x192.svg" color="#6366f1" />
          
          {/* Preconnect للخطوط */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://images.unsplash.com" />
          
          {/* الخطوط العربية */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800;900&display=swap" 
            rel="stylesheet" 
          />
          
          {/* الخطوط الإنجليزية */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=PT+Sans:wght@400;700&display=swap" 
            rel="stylesheet" 
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;


