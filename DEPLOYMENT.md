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
8. ✅ حل مشكلة `npn` (خطأ إملائي في Vercel)

## 🚨 مشكلة npn المكتشفة

```
sh: line 1: npn: command not found
Error: Command "npn run" exited with 127
```

**السبب**: خطأ إملائي في إعدادات Vercel - `npn` بدلاً من `npm`

### الحل السريع لمشكلة npn:

1. **استخدم الملف البديل:**
   ```bash
   mv vercel-fixed.json vercel.json
   git add .
   git commit -m "Fix npn typo in vercel config"
   git push origin main
   ```

2. **أو أعد كتابة vercel.json:**
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

## خطوات النشر:

1. **تأكد من تحديث الكود:**
   ```bash
   git add .
   git commit -m "Fix 404 error and npn typo - complete solution"
   git push origin main
   ```

2. **في Vercel Dashboard:**
   - اذهب إلى مشروعك
   - اضغط على "Settings" → "General"
   - تأكد من أن "Framework Preset" هو "Next.js"
   - تأكد من أن "Build Command" هو "npm run build"
   - تأكد من أن "Install Command" هو "npm ci"
   - اضغط على "Save"
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

#### الحل 2: استخدام ملف بديل
```bash
mv vercel-alt.json vercel.json
git add .
git commit -m "Try alternative vercel config"
git push origin main
```

#### الحل 3: فحص سجلات البناء
1. في Vercel Dashboard، اذهب إلى "Deployments"
2. اضغط على آخر deployment
3. تحقق من "Build Logs" و "Function Logs"

#### الحل 4: حل مشكلة npn
1. تأكد من أن `vercel.json` لا يحتوي على `npn`
2. تأكد من أن إعدادات Vercel Dashboard صحيحة
3. استخدم `vercel-fixed.json` كبديل

### ملفات مهمة يجب أن تكون موجودة:

- ✅ `pages/index.tsx` - الصفحة الرئيسية
- ✅ `pages/_app.tsx` - ملف التطبيق الرئيسي
- ✅ `pages/_document.tsx` - ملف HTML الرئيسي
- ✅ `next.config.js` - إعدادات Next.js
- ✅ `vercel.json` - إعدادات Vercel (بدون npn)
- ✅ `package.json` - تبعيات المشروع

### أوامر مفيدة للاختبار:

```bash
# اختبار البناء محلياً
npm run build

# اختبار التشغيل
npm run start

# تنظيف وإعادة بناء
rm -rf .next && npm run build

# فحص التبعيات
npm audit
npm outdated
```

## 📝 ملاحظات مهمة

- **npm** هو الأمر الصحيح
- **npn** هو خطأ إملائي
- تأكد من إعدادات Vercel Dashboard
- Framework Preset يجب أن يكون `Next.js`
- راجع ملف `QUICK-FIX-NPN.md` للحلول السريعة

---

**ملاحظة مهمة**: تم تطبيق حلول شاملة لمشكلة 404 ومشكلة npn في Vercel. راجع ملف `QUICK-FIX-NPN.md` للحلول السريعة. 