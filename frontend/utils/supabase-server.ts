import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    'https://lgtzrojqqxpyzutofrsk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndHpyb2pxcXhweXp1dG9mcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjUxNjEsImV4cCI6MjA2NzIwMTE2MX0.8hwURAP9dY9V9bI72Nc4eZCAs0dUSxQDda6-KuO4378',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
