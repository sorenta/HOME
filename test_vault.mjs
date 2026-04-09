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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log('URL:', env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('KEY:', env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...');

  let res1 = await supabase.schema('vault').rpc('create_secret', {
    secret: 'test_key',
    name: 'test_name_1',
    description: 'test_desc_1'
  });
  console.log('TEST 1 (secret):', res1.error?.message || 'Success', res1.error?.code, res1.data);

  let res2 = await supabase.schema('vault').rpc('create_secret', {
    new_secret: 'test_key',
    new_name: 'test_name_2',
    new_description: 'test_desc_2'
  });
  console.log('TEST 2 (new_secret):', res2.error?.message || 'Success', res2.error?.code, res2.data);
  
  if (res1.data) await supabase.schema('vault').rpc('delete_secret', { secret_id: res1.data });
  if (res2.data) await supabase.schema('vault').rpc('delete_secret', { secret_id: res2.data });
}
test();