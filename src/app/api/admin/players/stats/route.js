import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { getAdminSession } from '../../../../../middleware/adminAuth';

export async function GET(request) {
  try {
    // Verificar autenticação admin
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    // Buscar estatísticas dos players
    const { data: allPlayers, error: playersError } = await supabaseAdmin
      .from('players')
      .select('steamid64, benched, idmembership');

    if (playersError) {
      console.error('Erro ao buscar players:', playersError);
      return NextResponse.json({ error: 'Erro ao buscar dados dos players' }, { status: 500 });
    }

    const stats = {
      total: allPlayers.length,
      active: allPlayers.filter(p => !p.benched).length,
      benched: allPlayers.filter(p => p.benched).length,
      admins: allPlayers.filter(p => p.idmembership >= 2).length, // Admin (2) + Dono (3)
      premium: allPlayers.filter(p => p.idmembership === 1).length,
      members: allPlayers.filter(p => p.idmembership === 0).length,
      byMembership: {
        0: allPlayers.filter(p => p.idmembership === 0).length, // Membro
        1: allPlayers.filter(p => p.idmembership === 1).length, // Premium
        2: allPlayers.filter(p => p.idmembership === 2).length, // Admin
        3: allPlayers.filter(p => p.idmembership === 3).length, // Dono
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: stats 
    });

  } catch (error) {
    console.error('Erro na API de estatísticas de players:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
