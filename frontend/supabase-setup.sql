-- إنشاء جدول الملاحظات
CREATE TABLE IF NOT EXISTS notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- إدراج بيانات تجريبية
INSERT INTO notes (title) VALUES
  ('أول ملاحظة في Supabase'),
  ('ملاحظة تجريبية للاختبار'),
  ('ملاحظة أخرى للعرض');

-- تفعيل Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للقراءة العامة
CREATE POLICY "القراءة العامة للملاحظات" ON notes
FOR SELECT TO anon
USING (true);

-- إنشاء سياسة للإدراج
CREATE POLICY "الإدراج العام للملاحظات" ON notes
FOR INSERT TO anon
WITH CHECK (true);

-- إنشاء سياسة للتحديث
CREATE POLICY "التحديث العام للملاحظات" ON notes
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- إنشاء سياسة للحذف
CREATE POLICY "الحذف العام للملاحظات" ON notes
FOR DELETE TO anon
USING (true);
