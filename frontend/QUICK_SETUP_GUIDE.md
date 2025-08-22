# 🚀 دليل الإعداد السريع لقاعدة البيانات

## ❌ المشكلة الحالية:
النظام يحاول إنشاء مكتب جديد ولكن جدول `offices` غير موجود في Supabase.

## ✅ الحل السريع:

### 1. **اذهب إلى Supabase Dashboard:**
- [https://supabase.com/dashboard](https://supabase.com/dashboard)
- اختر مشروعك: `https://edwzbiaqarojxtdzraxz.supabase.co`

### 2. **افتح SQL Editor:**
- اضغط على **SQL Editor** في القائمة اليسرى
- اضغط **New Query**

### 3. **انسخ والصق الكود التالي:**
```sql
-- إعداد سريع لقاعدة البيانات للمشروع الجديد
-- Project: https://edwzbiaqarojxtdzraxz.supabase.co
-- انسخ هذا الملف والصقه في Supabase SQL Editor

-- إنشاء جدول المكاتب
CREATE TABLE IF NOT EXISTS offices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  office_id BIGINT REFERENCES offices(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- تفعيل RLS
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسات بسيطة للاختبار
CREATE POLICY "القراءة العامة" ON offices FOR SELECT TO anon USING (true);
CREATE POLICY "الإدراج العام" ON offices FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "القراءة العامة" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "الإدراج العام" ON users FOR INSERT TO anon WITH CHECK (true);

-- إنشاء مكتب افتراضي
INSERT INTO offices (name) VALUES ('المكتب الافتراضي') ON CONFLICT (name) DO NOTHING;
```

### 4. **اضغط Run:**
- اضغط على زر **Run** لتنفيذ الأوامر
- انتظر حتى تظهر رسالة "Success"

### 5. **تحقق من الجداول:**
- اذهب إلى **Table Editor**
- تأكد من وجود جدول `offices` و `users`

## 🧪 اختبار النظام:

### 1. **إنشاء حساب جديد:**
- اذهب إلى: `http://localhost:3000/register`
- جرب إنشاء حساب جديد

### 2. **تسجيل الدخول:**
- اذهب إلى: `http://localhost:3000/login`
- جرب تسجيل الدخول

## ⚠️ ملاحظات مهمة:

1. **تأكد من تنفيذ الأوامر** في Supabase
2. **تحقق من وجود الجداول** في Table Editor
3. **إذا ظهرت أخطاء**، راجع سجلات الأخطاء في Supabase

## 🔧 استكشاف الأخطاء:

### إذا ظهر خطأ "فشل في إنشاء المكتب":
- تأكد من وجود جدول `offices`
- تحقق من صحة السياسات (RLS)
- راجع سجلات الأخطاء في Supabase

### إذا ظهر خطأ "فشل في إنشاء المستخدم":
- تأكد من وجود جدول `users`
- تحقق من العلاقة مع جدول `offices`
- راجع سجلات الأخطاء في Supabase

---

**بعد تنفيذ هذه الخطوات، سيعمل النظام بشكل صحيح! 🎉**
