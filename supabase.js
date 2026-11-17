import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://bpqqrvflpgrzudkizjkt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcXFydmZscGdyenVka2l6amt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NjE1NTksImV4cCI6MjExMDEzNzU1OX0.L3hz9fW6UEpr-3s92dXNOZqRJZu4YY_xDzrLi6iY2PE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);