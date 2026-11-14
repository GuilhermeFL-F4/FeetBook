const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const app = express();
app.use(express.json());

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});