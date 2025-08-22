# دليل التطوير 🛠️

## إعداد البيئة المحلية

### 1. متطلبات النظام
- **Node.js**: الإصدار 22 أو أحدث
- **npm**: الإصدار 8 أو أحدث
- **Git**: لأجل إدارة الكود

### 2. استنساخ المشروع
```bash
git clone https://github.com/sbateeni/legal_analysis-nextjs-pro.git
cd legal_analysis-nextjs-pro
```

### 3. تثبيت التبعيات
```bash
npm install
```

### 4. إعداد متغيرات البيئة
أنشئ ملف `.env.local` في الجذر وأضف المتغيرات التالية:

```env
# Google Gemini API Key
# احصل على المفتاح من: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_gemini_api_key_here

# مفتاح التشفير للبيانات المحلية
# يجب أن يكون طويلاً وعشوائياً (32+ حرف)
NEXT_PUBLIC_ENCRYPTION_SECRET=your_32_character_encryption_secret_here

# مفتاح JWT للمصادقة
# يجب أن يكون طويلاً وعشوائياً (32+ حرف)
JWT_SECRET=your_32_character_jwt_secret_here

# Vercel Blob Token للمصادقة
# احصل على المفتاح من لوحة تحكم Vercel
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# إعدادات إضافية (اختيارية)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. تشغيل التطوير
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح

## 🧪 الاختبارات

### تشغيل الاختبارات
```bash
# جميع الاختبارات
npm run test

# الاختبارات في وضع المراقبة
npm run test:watch

# اختبارات محددة
npm test -- --run tests/safety.test.ts
```

### كتابة اختبارات جديدة
1. أنشئ ملف `.test.ts` في مجلد `tests/`
2. اتبع نمط الاختبارات الموجودة
3. استخدم `describe` و `it` من Vitest
4. تأكد من تغطية جميع الحالات

## 🔍 فحص الكود

### ESLint
```bash
npm run lint
```

### TypeScript
```bash
npx tsc --noEmit
```

## 🏗️ البنية

### المجلدات الرئيسية
- `pages/`: صفحات Next.js و API routes
- `components/`: مكونات React قابلة لإعادة الاستخدام
- `utils/`: دوال مساعدة وأدوات
- `types/`: تعريفات TypeScript
- `styles/`: ملفات CSS
- `stages/`: مراحل التحليل القانوني
- `contexts/`: React Contexts
- `public/`: الملفات العامة

### معايير الكود
- **TypeScript**: إجباري لجميع الملفات الجديدة
- **ESLint**: اتبع قواعد ESLint المحددة
- **Prettier**: تنسيق تلقائي للكود
- **التعليقات**: باللغة العربية للوظائف المعقدة

## 🚀 النشر

### Vercel (موصى به)
```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

### متغيرات البيئة في الإنتاج
تأكد من إضافة جميع متغيرات البيئة في لوحة تحكم Vercel

## 🔧 الأدوات المساعدة

### تنظيف المشروع
```bash
npm run clean
```

### إعادة بناء
```bash
npm run build
```

### تشغيل الإنتاج محلياً
```bash
npm run build
npm start
```

## 📝 المساهمة

### إرشادات المساهمة
1. **Fork** المشروع
2. أنشئ فرع للميزة الجديدة
3. اكتب اختبارات للميزات الجديدة
4. تأكد من نجاح جميع الاختبارات
5. اتبع معايير الكود
6. اكتب توثيق للميزات الجديدة
7. أرسل Pull Request

### معايير الـ Commit
- استخدم اللغة العربية في رسائل الـ commit
- اتبع نمط: `نوع: وصف مختصر`
- أمثلة:
  - `إصلاح: تصحيح خطأ في التحقق من المدخلات`
  - `ميزة: إضافة دعم للتصدير إلى PDF`
  - `تحسين: تحسين أداء قاعدة البيانات`

## 🐛 إصلاح الأخطاء

### مشاكل شائعة

#### خطأ في بناء Next.js
```bash
# تنظيف وإعادة تثبيت
npm run clean
npm install
npm run build
```

#### مشاكل في TypeScript
```bash
# فحص الأخطاء
npx tsc --noEmit

# إعادة بناء cache
rm -rf .next
npm run dev
```

#### مشاكل في الاختبارات
```bash
# تنظيف cache الاختبارات
npm test -- --clearCache
```

## 📚 الموارد

### الوثائق الرسمية
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

### أدوات التطوير
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Vitest](https://vitest.dev)

## 🤝 الدعم

للدعم الفني أو الأسئلة:
- افتح [Issue](https://github.com/sbateeni/legal_analysis-nextjs-pro/issues) جديد
- استخدم [Discussions](https://github.com/sbateeni/legal_analysis-nextjs-pro/discussions)
- راجع الوثائق في هذا الملف

---

**ملاحظة**: تأكد من أن جميع التغييرات متوافقة مع النظام القانوني الفلسطيني وأنها لا تخرج عن نطاق التطبيق المحدد. 