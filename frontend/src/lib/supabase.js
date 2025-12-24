import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL  || 'https://stbpayojdeddtejktwcq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YnBheW9qZGVkZHRlamt0d2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDk3MjEsImV4cCI6MjA4MTc4NTcyMX0.n836ZCWCgOdcPFxSZj3G5zzKfq-fXme69H467s-ynWU'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
