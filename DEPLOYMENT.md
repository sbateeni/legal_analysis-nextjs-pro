# دليل النشر - Legal Analysis Next.js

## حل مشكلة 404 في Vercel

### المشاكل المحلولة:

1. ✅ إزالة مسار `@/*` غير الصحيح من `tsconfig.json`
2. ✅ تنظيف مجلد `pages` من الملفات غير الضرورية
3. ✅ إنشاء ملف `_document.tsx`
4. ✅ تحويل `next.config.ts` إلى `next.config.js`
5. ✅ تحديث `vercel.json` مع إعدادات `rewrites`
6. ✅ إنشاء `.vercelignore`
7. ✅ تحسين سكريبت البناء

### خطوات النشر:

1. **تأكد من تحديث الكود:**
   ```bash
   git add .
   git commit -m "Fix 404 error - complete solution"
   git push origin main
   ```

2. **في Vercel Dashboard:**
   - اذهب إلى مشروعك
   - اضغط على "Settings" → "General"
   - تأكد من أن "Framework Preset" هو "Next.js"
   - اضغط على "Redeploy"

3. **إعدادات البناء المطلوبة:**
   - Build Command: `npm run build`
   - Install Command: `npm ci`
   - Output Directory: `.next`
   - Root Directory: `./` (أو اتركه فارغاً)

### إعدادات البيئة:

تأكد من تعيين المتغيرات التالية في Vercel:
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`

### اختبار الموقع:

بعد النشر، اختبر:
1. الصفحة الرئيسية `/`
2. صفحات API `/api/*`
3. الصفحات الأخرى مثل `/login`, `/register`

### إذا استمرت المشكلة:

#### الحل 1: إعادة تعيين المشروع
1. احذف المشروع من Vercel
2. أعد ربطه مع Git
3. تأكد من اختيار "Next.js" كـ Framework

#### الحل 2: فحص سجلات البناء
1. في Vercel Dashboard، اذهب إلى "Deployments"
2. اضغط على آخر deployment
3. تحقق من "Build Logs" و "Function Logs"

#### الحل 3: فحص إعدادات النطاق
1. تأكد من أن النطاق مرتبط بشكل صحيح
2. تحقق من إعدادات DNS

### ملفات مهمة يجب أن تكون موجودة:

- ✅ `pages/index.tsx` - الصفحة الرئيسية
- ✅ `pages/_app.tsx` - ملف التطبيق الرئيسي
- ✅ `pages/_document.tsx` - ملف HTML الرئيسي
- ✅ `next.config.js` - إعدادات Next.js
- ✅ `vercel.json` - إعدادات Vercel
- ✅ `package.json` - تبعيات المشروع

### أوامر مفيدة للاختبار المحلي:

```bash
# اختبار البناء محلياً
npm run build

# اختبار التشغيل
npm run start

# تنظيف وإعادة بناء
rm -rf .next && npm run build
``` 