-- إعداد بسيط لقاعدة البيانات
-- انسخ هذا الملف والصقه في Supabase SQL Editor

-- 1. إنشاء جدول المكاتب
CREATE TABLE IF NOT EXISTS offices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  office_id BIGINT REFERENCES offices(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- 3. تفعيل Row Level Security
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. إنشاء سياسات بسيطة
-- سياسات المكاتب
CREATE POLICY "offices_select_policy" ON offices FOR SELECT USING (true);
CREATE POLICY "offices_insert_policy" ON offices FOR INSERT WITH CHECK (true);
CREATE POLICY "offices_update_policy" ON offices FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "offices_delete_policy" ON offices FOR DELETE USING (true);

-- سياسات المستخدمين
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (true);

-- 5. إنشاء مكتب افتراضي
INSERT INTO offices (name) VALUES ('المكتب الافتراضي') ON CONFLICT (name) DO NOTHING;

-- 6. إنشاء مستخدم افتراضي (admin)
-- كلمة المرور: admin123
INSERT INTO users (username, email, password_hash, role, office_id) 
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  (SELECT id FROM offices WHERE name = 'المكتب الافتراضي')
) ON CONFLICT (username) DO NOTHING;

-- 7. عرض النتائج
SELECT 'تم إنشاء الجداول بنجاح!' as status;
SELECT 'offices' as table_name, COUNT(*) as count FROM offices
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users;
