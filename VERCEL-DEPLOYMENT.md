# 🚀 دليل النشر على Vercel - Legal Analysis Platform

## 📁 بنية المشروع المحدثة

```
legal_analysis-nextjs-pro/
├── pages/                   # صفحات Next.js
│   ├── index.tsx           # الصفحة الرئيسية
│   ├── _app.tsx            # ملف التطبيق الرئيسي
│   ├── _document.tsx       # ملف HTML الرئيسي
│   └── api/                # نقاط النهاية API
├── components/              # مكونات React
├── utils/                   # الأدوات المساعدة
├── types/                   # تعريفات TypeScript
├── styles/                  # ملفات CSS
├── public/                  # الملفات العامة
├── next.config.js           # إعدادات Next.js
├── vercel.json              # إعدادات Vercel
├── tsconfig.json            # إعدادات TypeScript
├── package.json             # تبعيات المشروع
└── vercel-build.sh          # سكريبت البناء
```

## ✅ الملفات المطلوبة للنشر

### 1. **vercel.json** - إعدادات Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
```

### 2. **next.config.js** - إعدادات Next.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  output: 'standalone',
  trailingSlash: false,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['idb-keyval'],
  },
  distDir: '.next',
  devIndicators: {
    position: 'bottom-right',
  },
};

module.exports = nextConfig;
```

### 3. **tsconfig.json** - إعدادات TypeScript
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/pages/*": ["./pages/*"],
      "@/utils/*": ["./utils/*"],
      "@/types/*": ["./types/*"],
      "@/styles/*": ["./styles/*"],
      "@/public/*": ["./public/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "frontend/**/*"]
}
```

## 🚀 خطوات النشر

### 1. **تأكد من تحديث الكود:**
```bash
git add .
git commit -m "Update project structure for Vercel deployment"
git push origin main
```

### 2. **في Vercel Dashboard:**
- اذهب إلى مشروعك
- اضغط على "Settings" → "General"
- تأكد من الإعدادات:
  - **Framework Preset**: `Next.js`
  - **Build Command**: اتركه فارغاً
  - **Install Command**: اتركه فارغاً
  - **Output Directory**: `.next`
  - **Root Directory**: `./`
- اضغط على "Save"

### 3. **اضغط على "Redeploy":**
- في Vercel Dashboard
- اضغط على "Redeploy" لاستخدام الكود الجديد
- انتظر حتى يكتمل البناء

## 🔧 إعدادات البيئة

### متغيرات البيئة المطلوبة في Vercel:
- `NODE_ENV`: `production`
- `GOOGLE_API_KEY`: مفتاح Gemini API
- `NEXT_PUBLIC_ENCRYPTION_SECRET`: مفتاح التشفير

## 📋 قائمة فحص النشر

- [ ] `vercel.json` موجود وصحيح
- [ ] `next.config.js` محدث
- [ ] `tsconfig.json` محدث
- [ ] `package.json` محدث
- [ ] `pages/index.tsx` موجود
- [ ] `pages/_app.tsx` موجود
- [ ] إعدادات Vercel Dashboard صحيحة
- [ ] Framework Preset هو `Next.js`
- [ ] متغيرات البيئة محددة

## 🆘 استكشاف الأخطاء

### إذا فشل البناء:
1. تحقق من سجلات البناء في Vercel
2. تأكد من وجود جميع الملفات المطلوبة
3. تحقق من إعدادات TypeScript
4. تأكد من إعدادات Next.js

### إذا ظهر خطأ 404:
1. تأكد من وجود `pages/index.tsx`
2. تحقق من إعدادات `vercel.json`
3. تأكد من `next.config.js`

## 📝 ملاحظات مهمة

- تم إعادة ترتيب بنية المشروع
- تم تحديث جميع ملفات التكوين
- تم إزالة المجلدات غير المستخدمة
- تم تحسين إعدادات TypeScript
- تم تحسين إعدادات Next.js

---

**ملاحظة**: الآن المشروع جاهز للنشر على Vercel مع بنية محدثة ومحسنة! 