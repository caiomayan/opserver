import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Updated API to handle single player requests
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamid = searchParams.get('teamid');
  const playerIds = searchParams.get('playerIds')?.split(',') || null;
  const id = searchParams.get('id'); // Single player ID

  console.log('🔍 API Players chamada:', { teamid, playerIds, id });

  let query = supabase.from('players').select('*');
  if (id) {
    console.log('📊 Buscando player único por ID:', id);
    query = supabase.from('players').select('*').eq('steamid64', id);
  } else if (teamid) {
    console.log('📊 Buscando players do time:', teamid);
    query = supabase.from('players').select('*').eq('teamid', teamid);
  } else if (playerIds) {
    console.log('📊 Buscando players por IDs:', playerIds);
    query = supabase.from('players').select('*').in('steamid64', playerIds);
  } else {
    console.log('📊 Buscando todos os players');
  }

  let { data: playersData, error } = await query;
  if (error) {
    console.error('💥 Erro Supabase:', error);
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }

  console.log(`📊 Encontrados ${playersData?.length || 0} players no Supabase`);
  if (playersData?.length > 0) {
    console.log('👥 Primeiros players encontrados:', playersData.slice(0, 3).map(p => ({ name: p.name, teamid: p.teamid, steamid64: p.steamid64 })));
  }

  const getSteamAvatar = async (steamid64) => {
    try {
      const steamApiUrl = process.env.STEAM_API_URL;
      const steamApiKey = process.env.STEAM_API_KEY;
      
      if (!steamApiUrl || !steamApiKey) {
        return null;
      }

      const response = await fetch(
        `${steamApiUrl}?key=${steamApiKey}&steamids=${steamid64}`,
        { 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (compatible; OpServer/1.0)',
          },
          signal: AbortSignal.timeout(10000), // 10s timeout
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.response?.players?.[0]?.avatarfull || null;
    } catch (error) {
      return null;
    }
  };

  try {
    const playersWithData = await Promise.all(
      playersData.map(async (player) => {
        let avatar = null;
        let configs = null;
        
        if (player.steamid64) {
          avatar = await getSteamAvatar(player.steamid64);
          
          // Buscar configs detalhadas do jogador
          const { data: configsData, error: configsError } = await supabase
            .from('player_configs')
            .select('*')
            .eq('steamid64', player.steamid64)
            .single();
          configs = configsError ? null : configsData;
        }
        
        return {
          ...player,
          avatar,
          configs
        };
      })
    );
    
    console.log(`✅ Retornando ${playersWithData.length} players processados`);
    
    // If requesting a single player by ID, return specific format
    if (id && playersWithData.length > 0) {
      const player = playersWithData[0];
      
      // Get team data if player has teamid
      let team = null;
      if (player.teamid) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', player.teamid)
          .single();
        team = teamError ? null : teamData;
      }
      
      return NextResponse.json({
        player: player,
        config: player.configs,
        team: team
      });
    }
    
    return NextResponse.json({ data: playersWithData });
  } catch (error) {
    console.error('💥 Erro geral na API players:', error);
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }
}
