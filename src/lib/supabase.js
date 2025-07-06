import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://auahxbkwrvhdtksohjky.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1YWh4Ymt3cnZoZHRrc29oamt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Njc1NjgsImV4cCI6MjA2NzI0MzU2OH0.u9BrXqP1xOVA9ZEY1dQszlmZnNyHb6WXSbahER0mlfM'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

export default supabase