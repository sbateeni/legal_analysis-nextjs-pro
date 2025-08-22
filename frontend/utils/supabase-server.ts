import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    'https://edwzbiaqarojxtdzraxz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkd3piaWFxYXJvanh0ZHpyYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTE3MTAsImV4cCI6MjA3MTQ2NzcxMH0.RADw0FPJe8di9P1_nTF9oCPQEpsCuA35BAoAsM05BcI',
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
