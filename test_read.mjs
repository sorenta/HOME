import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const content = fs.readFileSync('.env.local', 'utf-8');
const env = {};
content.split('\n').forEach(line => {
  const eq = line.indexOf('=');
  if (eq > 0) {
    const k = line.substring(0, eq).trim();
    let v = line.substring(eq + 1).trim().replace(/\r/g, '');
    if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length - 1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.substring(1, v.length - 1);
    env[k] = v;
  }
});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log("Fetching from user_kitchen_ai...");
  const { data, error } = await supabaseAdmin
    .from("user_kitchen_ai")
    .select("vault_secret_id")
    .limit(1);
    
  console.log("Data:", data);
  console.log("Error:", error);
}
test();