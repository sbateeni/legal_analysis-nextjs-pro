export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: number
          title: string
          created_at?: string
        }
        Insert: {
          id?: number
          title: string
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          created_at?: string
        }
      }
      // يمكنك إضافة المزيد من الجداول هنا
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
