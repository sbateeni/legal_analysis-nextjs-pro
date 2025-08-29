import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ar" dir="rtl">
        <Head>
          <meta name="theme-color" content="#6366f1" />
          <link rel="manifest" href="/manifest.json" />
          
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


