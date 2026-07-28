import { createClient } from '@supabase/supabase-js';

// Supabase anon key is safe to expose on the client (it only has public read-level access).
// Row Level Security (RLS) controls actual data access on the Supabase side.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jxvnggarbgzpmjykulhj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dm5nZ2FyYmd6cG1qeWt1bGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMDczMzMsImV4cCI6MjEwMDc4MzMzM30.j2trqhEjvztx99Kb0_8By1uPosZMTx7sMrstPPxzTsM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
