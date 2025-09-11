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

    // Buscar estatísticas dos times
    const { data: allTeams, error: teamsError } = await supabaseAdmin
      .from('teams')
      .select('id, name, countryid');

    if (teamsError) {
      console.error('Erro ao buscar teams:', teamsError);
      return NextResponse.json({ error: 'Erro ao buscar dados dos times' }, { status: 500 });
    }

    // Buscar quantos players por time
    const { data: playersPerTeam, error: playersError } = await supabaseAdmin
      .from('players')
      .select('teamid')
      .not('teamid', 'is', null);

    const teamPlayerCounts = {};
    if (!playersError && playersPerTeam) {
      playersPerTeam.forEach(player => {
        teamPlayerCounts[player.teamid] = (teamPlayerCounts[player.teamid] || 0) + 1;
      });
    }

    const stats = {
      total: allTeams.length,
      withPlayers: Object.keys(teamPlayerCounts).length,
      emptyTeams: allTeams.length - Object.keys(teamPlayerCounts).length,
      averagePlayersPerTeam: Object.keys(teamPlayerCounts).length > 0 
        ? (Object.values(teamPlayerCounts).reduce((a, b) => a + b, 0) / Object.keys(teamPlayerCounts).length).toFixed(1)
        : 0,
      teamPlayerCounts
    };

    return NextResponse.json({ 
      success: true, 
      data: stats 
    });

  } catch (error) {
    console.error('Erro na API de estatísticas de teams:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
