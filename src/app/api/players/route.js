import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamid = searchParams.get('teamid');
  const playerIds = searchParams.get('playerIds')?.split(',') || null;
  let { data: playersData, error } = await supabase.from('players').select('*');
  if (error) playersData = [];
  let targetPlayers = playersData;
  if (teamid) {
    targetPlayers = playersData.filter(player => player.teamid === teamid);
  } else if (playerIds) {
    targetPlayers = playersData.filter(player => playerIds.includes(player.steamid64));
  }
  const getSteamAvatar = async (steamid64) => {
    try {
      const steamApiUrl = process.env.STEAM_API_URL;
      const steamApiKey = process.env.STEAM_API_KEY;
      if (!steamApiUrl || !steamApiKey) return null;
      const response = await fetch(
        `${steamApiUrl}?key=${steamApiKey}&steamids=${steamid64}`,
        { timeout: 5000, headers: { 'User-Agent': 'OPSERVER/1.0' } }
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
      targetPlayers.map(async (player) => {
        let avatar = null;
        if (player.steamid64) {
          avatar = await getSteamAvatar(player.steamid64);
        }
        return {
          ...player,
          avatar
        };
      })
    );
    return NextResponse.json(playersWithData);
  } catch (error) {
    const playersWithError = targetPlayers.map(player => ({
      ...player,
      avatar: null
    }));
    return NextResponse.json(playersWithError);
  }
}
