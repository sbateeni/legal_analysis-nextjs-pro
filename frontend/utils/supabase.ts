import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://edwzbiaqarojxtdzraxz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkd3piaWFxYXJvanh0ZHpyYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTE3MTAsImV4cCI6MjA3MTQ2NzcxMH0.RADw0FPJe8di9P1_nTF9oCPQEpsCuA35BAoAsM05BcI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to create server-side client
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
