import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamid = searchParams.get('teamid');
  const playerIds = searchParams.get('playerIds')?.split(',') || null;
  let query = supabase.from('players').select('*');
  if (teamid) {
    query = supabase.from('players').select('*').eq('teamid', teamid);
  } else if (playerIds) {
    query = supabase.from('players').select('*').in('steamid64', playerIds);
  }
  let { data: playersData, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }
  const getSteamAvatar = async (steamid64) => {
    try {
      const steamApiUrl = process.env.STEAM_API_URL;
      const steamApiKey = process.env.STEAM_API_KEY;
      if (!steamApiUrl || !steamApiKey) return null;
      const response = await fetch(
        `${steamApiUrl}?key=${steamApiKey}&steamids=${steamid64}`,
        { headers: { 'User-Agent': 'OPSERVER/1.0' } }
      );
      if (!response.ok) return null;
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
    return NextResponse.json({ data: playersWithData });
  } catch (error) {
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }
}
