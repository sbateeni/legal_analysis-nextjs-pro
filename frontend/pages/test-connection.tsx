import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

export default function TestConnection() {
  const [status, setStatus] = useState<string>('جاري الاختبار...')
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<any[]>([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus('جاري اختبار الاتصال...')
      
      // اختبار الاتصال الأساسي
      const { data, error: connectionError } = await supabase
        .from('offices')
        .select('*')
        .limit(1)

      if (connectionError) {
        if (connectionError.code === '42P01') {
          setError('جدول offices غير موجود! يجب إنشاؤه أولاً.')
          setStatus('فشل في الاتصال')
        } else {
          setError(`خطأ في الاتصال: ${connectionError.message}`)
          setStatus('فشل في الاتصال')
        }
        return
      }

      setStatus('الاتصال ناجح!')
      
      // محاولة إنشاء مكتب تجريبي
      const { data: insertData, error: insertError } = await supabase
        .from('offices')
        .insert([{ name: 'مكتب الاختبار' }])
        .select('*')

      if (insertError) {
        setError(`خطأ في إنشاء مكتب: ${insertError.message}`)
        setStatus('فشل في إنشاء مكتب')
        return
      }

      setStatus('تم إنشاء مكتب بنجاح!')
      
      // جلب جميع المكاتب
      const { data: allOffices, error: selectError } = await supabase
        .from('offices')
        .select('*')

      if (selectError) {
        setError(`خطأ في جلب المكاتب: ${selectError.message}`)
        return
      }

      setTables(allOffices || [])

    } catch (err: any) {
      setError(`خطأ غير متوقع: ${err.message}`)
      setStatus('فشل في الاختبار')
    }
  }

  const createTables = async () => {
    try {
      setStatus('جاري إنشاء الجداول...')
      
      // إنشاء جدول offices
      const { error: officesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS offices (
            id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );
        `
      })

      if (officesError) {
        setError(`خطأ في إنشاء جدول offices: ${officesError.message}`)
        return
      }

      // إنشاء جدول users
      const { error: usersError } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
      })

      if (usersError) {
        setError(`خطأ في إنشاء جدول users: ${usersError.message}`)
        return
      }

      setStatus('تم إنشاء الجداول بنجاح!')
      
      // اختبار الاتصال مرة أخرى
      setTimeout(testConnection, 1000)

    } catch (err: any) {
      setError(`خطأ في إنشاء الجداول: ${err.message}`)
      setStatus('فشل في إنشاء الجداول')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          اختبار الاتصال بـ Supabase
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">حالة الاتصال</h2>
          <div className="mb-4">
            <span className="font-medium">الحالة:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
              status.includes('نجح') ? 'bg-green-100 text-green-800' :
              status.includes('فشل') ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {status}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={testConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              اختبار الاتصال
            </button>
            
            <button
              onClick={createTables}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              إنشاء الجداول
            </button>
          </div>
        </div>

        {tables.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">المكاتب الموجودة</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-right">ID</th>
                    <th className="px-4 py-2 text-right">اسم المكتب</th>
                    <th className="px-4 py-2 text-right">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((office: any) => (
                    <tr key={office.id} className="border-b">
                      <td className="px-4 py-2 text-center">{office.id}</td>
                      <td className="px-4 py-2 text-right">{office.name}</td>
                      <td className="px-4 py-2 text-center">
                        {new Date(office.created_at).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">تعليمات سريعة:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>اضغط "اختبار الاتصال" لفحص الحالة الحالية</li>
            <li>إذا فشل الاتصال، اضغط "إنشاء الجداول"</li>
            <li>أو اذهب إلى Supabase Dashboard وأنشئ الجداول يدوياً</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
