import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

interface Note {
  id: number
  title: string
}

export default function SupabaseTest() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newNoteTitle, setNewNoteTitle] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        throw error
      }

      setNotes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const addNote = async () => {
    if (!newNoteTitle.trim()) return

    try {
      const { error } = await supabase
        .from('notes')
        .insert([{ title: newNoteTitle.trim() }])

      if (error) {
        throw error
      }

      setNewNoteTitle('')
      fetchNotes() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في إضافة الملاحظة')
    }
  }

  const deleteNote = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      fetchNotes() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حذف الملاحظة')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            اختبار Supabase
          </h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">إضافة ملاحظة جديدة</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="أدخل عنوان الملاحظة..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
              />
              <button
                onClick={addNote}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                إضافة
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">الملاحظات ({notes.length})</h2>
            {notes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد ملاحظات بعد</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-gray-800">{note.title}</span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">معلومات الاتصال</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>URL:</strong> https://lgtzrojqqxpyzutofrsk.supabase.co</p>
            <p><strong>الحالة:</strong> متصل</p>
            <p><strong>عدد الملاحظات:</strong> {notes.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
