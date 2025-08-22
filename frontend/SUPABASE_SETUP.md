# دليل إعداد Supabase

## الخطوات المطلوبة

### 1. إعداد قاعدة البيانات في Supabase

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك: `supabase-teal-garden`
3. اذهب إلى **SQL Editor**
4. انسخ محتوى ملف `supabase-setup.sql` والصقه في المحرر
5. اضغط **Run** لتنفيذ الأوامر

### 2. إنشاء جدول الملاحظات

سيتم إنشاء جدول `notes` مع الأعمدة التالية:
- `id`: معرف فريد (يتم إنشاؤه تلقائياً)
- `title`: عنوان الملاحظة
- `created_at`: تاريخ الإنشاء

### 3. تفعيل Row Level Security (RLS)

تم تفعيل RLS وإنشاء السياسات التالية:
- **القراءة العامة**: يمكن للجميع قراءة الملاحظات
- **الإدراج**: يمكن للجميع إضافة ملاحظات جديدة
- **التحديث**: يمكن للجميع تحديث الملاحظات
- **الحذف**: يمكن للجميع حذف الملاحظات

## اختبار الاتصال

### 1. تشغيل المشروع

```bash
npm run dev
```

### 2. زيارة صفحة الاختبار

اذهب إلى: `http://localhost:3000/supabase-test`

### 3. اختبار الوظائف

- عرض الملاحظات الموجودة
- إضافة ملاحظة جديدة
- حذف ملاحظة

## الملفات المهمة

- `utils/supabase.ts` - تكوين العميل الأساسي
- `utils/supabase-server.ts` - تكوين الخادم
- `middleware.ts` - middleware للتحكم في الجلسات
- `types/supabase.ts` - أنواع TypeScript
- `pages/supabase-test.tsx` - صفحة الاختبار

## استكشاف الأخطاء

### مشكلة في الاتصال
- تأكد من صحة URL و API Key
- تحقق من إعدادات CORS في Supabase

### مشكلة في الجدول
- تأكد من تنفيذ أوامر SQL
- تحقق من وجود الجدول في Table Editor

### مشكلة في السياسات
- تأكد من تفعيل RLS
- تحقق من صحة السياسات

## الخطوات التالية

بعد التأكد من عمل الاتصال، يمكنك:

1. إنشاء جداول إضافية
2. إضافة نظام مصادقة
3. إنشاء واجهات مستخدم متقدمة
4. إضافة وظائف البحث والتصفية

## روابط مفيدة

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)
