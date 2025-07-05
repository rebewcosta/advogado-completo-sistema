
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://lqprcsquknlegzmzdoct.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHJjc3F1a25sZWd6bXpkb2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzA4NjAsImV4cCI6MjA2Mjg0Njg2MH0.7L4U-NZvY_WzQy6svqL7xzSUdGVvQ0IkYd-L6PhdYJs'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
