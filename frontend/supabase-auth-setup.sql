-- إنشاء جدول المكاتب
CREATE TABLE IF NOT EXISTS offices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  office_id BIGINT REFERENCES offices(id),
  parent_user_id BIGINT REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_office_id ON users(office_id);
CREATE INDEX IF NOT EXISTS idx_users_parent_user_id ON users(parent_user_id);

-- تفعيل Row Level Security
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسات المكاتب
CREATE POLICY "القراءة العامة للمكاتب" ON offices
FOR SELECT TO anon
USING (true);

CREATE POLICY "الإدراج العام للمكاتب" ON offices
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "التحديث العام للمكاتب" ON offices
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- سياسات المستخدمين
CREATE POLICY "القراءة العامة للمستخدمين" ON users
FOR SELECT TO anon
USING (true);

CREATE POLICY "الإدراج العام للمستخدمين" ON users
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "التحديث العام للمستخدمين" ON users
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- إنشاء مكتب افتراضي
INSERT INTO offices (name) VALUES ('المكتب الافتراضي') ON CONFLICT (name) DO NOTHING;

-- إنشاء مستخدم افتراضي (admin)
-- كلمة المرور: admin123 (مشفرة بـ bcrypt)
INSERT INTO users (username, email, password_hash, role, office_id) 
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  (SELECT id FROM offices WHERE name = 'المكتب الافتراضي')
) ON CONFLICT (username) DO NOTHING;
