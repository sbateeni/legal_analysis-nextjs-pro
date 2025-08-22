-- إعداد سريع لقاعدة البيانات
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
