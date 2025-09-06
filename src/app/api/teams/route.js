import { supabase } from '../../../lib/supabase';
export async function GET() {
  try {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) {
      return Response.json({ error: error.message, data: [] }, { status: 500 });
    }
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message || 'Erro desconhecido', data: [] }, { status: 500 });
  }
}
