# 🚨 حل مشكلة npn في Vercel

## ⚠️ المشكلة المكتشفة

```
sh: line 1: npn: command not found
Error: Command "npn run" exited with 127
```

**السبب**: خطأ إملائي في إعدادات Vercel - `npn` بدلاً من `npm`

## 🚀 الحل السريع

### 1. استخدم الملف البديل:
```bash
mv vercel-fixed.json vercel.json
git add .
git commit -m "Fix npn typo in vercel config"
git push origin main
```

### 2. أو أعد كتابة vercel.json:
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

## 🔧 الحل في Vercel Dashboard

### 1. اذهب إلى مشروعك في Vercel
### 2. اضغط على "Settings" → "General"
### 3. تأكد من الإعدادات التالية:
- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build`
- **Install Command**: `npm ci`
- **Output Directory**: `.next`
- **Root Directory**: `./` (أو اتركه فارغاً)

### 4. اضغط على "Save"
### 5. اضغط على "Redeploy"

## 📋 قائمة فحص

- [ ] `vercel.json` لا يحتوي على `npn`
- [ ] `vercel.json` يحتوي على `npm` صحيح
- [ ] إعدادات Vercel Dashboard صحيحة
- [ ] Framework Preset هو `Next.js`

## 🆘 إذا استمرت المشكلة

### الحل البديل 1: إعادة تعيين المشروع
1. احذف المشروع من Vercel
2. أعد ربطه مع Git
3. تأكد من اختيار "Next.js" كـ Framework

### الحل البديل 2: استخدام ملف بديل
```bash
# جرب vercel-alt.json
mv vercel-alt.json vercel.json
git add .
git commit -m "Use alternative vercel config"
git push origin main
```

## 📝 ملاحظات مهمة

- **npm** هو الأمر الصحيح
- **npn** هو خطأ إملائي
- تأكد من إعدادات Vercel Dashboard
- Framework Preset يجب أن يكون `Next.js`

---

**ملاحظة**: هذه المشكلة شائعة في Vercel. الحل هو التأكد من استخدام `npm` وليس `npn`. 