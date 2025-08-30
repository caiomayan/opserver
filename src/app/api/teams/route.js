
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
export async function GET() {
  try {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) return Response.json([], { status: 500 });
    return Response.json(data);
  } catch (error) {
    return Response.json([], { status: 500 });
  }
}
