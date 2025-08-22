# دليل النشر - Legal Analysis Next.js

## حل مشكلة 404 في Vercel

### المشاكل المحلولة:

1. ✅ إزالة مسار `@/*` غير الصحيح من `tsconfig.json`
2. ✅ تبسيط إعدادات `vercel.json`
3. ✅ إنشاء ملف `_document.tsx`
4. ✅ تحديث `next.config.ts`

### خطوات النشر:

1. **تأكد من تحديث الكود:**
   ```bash
   git add .
   git commit -m "Fix 404 error and deployment issues"
   git push origin main
   ```

2. **في Vercel Dashboard:**
   - اذهب إلى مشروعك
   - اضغط على "Redeploy"
   - تأكد من أن إعدادات البناء صحيحة

3. **إعدادات البناء المطلوبة:**
   - Build Command: `npm run build`
   - Install Command: `npm ci`
   - Output Directory: `.next`

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

1. تحقق من سجلات البناء في Vercel
2. تأكد من أن جميع التبعيات مثبتة
3. تحقق من إعدادات النطاق في Vercel 