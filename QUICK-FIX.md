# 🚀 حل سريع لمشكلة 404 في Vercel

## ⚡ الحل السريع (5 دقائق)

### 1. تأكد من الملفات المطلوبة:
```bash
# تحقق من وجود الملفات الأساسية
ls -la pages/index.tsx
ls -la pages/_app.tsx
ls -la next.config.js
ls -la vercel.json
```

### 2. إعادة بناء المشروع:
```bash
# تنظيف وإعادة بناء
rm -rf .next node_modules
npm install
npm run build
```

### 3. رفع التغييرات:
```bash
git add .
git commit -m "Quick fix for 404 error"
git push origin main
```

### 4. في Vercel Dashboard:
- اذهب إلى مشروعك
- اضغط على "Redeploy"

## 🔧 إذا لم يعمل الحل السريع

### الحل البديل 1: استخدام ملف vercel.json مختلف
```bash
mv vercel-alt.json vercel.json
git add .
git commit -m "Use alternative vercel config"
git push origin main
```

### الحل البديل 2: إعادة تعيين المشروع
1. احذف المشروع من Vercel
2. أعد ربطه مع Git
3. تأكد من اختيار "Next.js" كـ Framework

## 📋 قائمة فحص سريعة

- [ ] `pages/index.tsx` موجود
- [ ] `pages/_app.tsx` موجود
- [ ] `next.config.js` موجود
- [ ] `vercel.json` موجود
- [ ] `tsconfig.json` لا يحتوي على `@/*`
- [ ] البناء يعمل محلياً (`npm run build`)
- [ ] التطبيق يعمل محلياً (`npm run start`)

## 🆘 إذا استمرت المشكلة

راجع ملف `DEPLOYMENT.md` للحصول على حلول مفصلة وشاملة.

---

**ملاحظة**: هذا الملف يحتوي على حلول سريعة. للحلول الكاملة، راجع `DEPLOYMENT.md`. 