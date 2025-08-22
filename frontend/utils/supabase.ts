import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lgtzrojqqxpyzutofrsk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndHpyb2pxcXhweXp1dG9mcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjUxNjEsImV4cCI6MjA2NzIwMTE2MX0.8hwURAP9dY9V9bI72Nc4eZCAs0dUSxQDda6-KuO4378'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to create server-side client
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
