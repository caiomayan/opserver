import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamid = searchParams.get('teamid');
  const playerIds = searchParams.get('playerIds')?.split(',') || null;

  // 🔍 DEBUG: Log de environment no Vercel
  console.log('🔧 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    STEAM_API_URL: process.env.STEAM_API_URL ? 'DEFINED' : 'MISSING',
    STEAM_API_KEY: process.env.STEAM_API_KEY ? 'DEFINED' : 'MISSING'
  });

  let query = supabase.from('players').select('*');
  if (teamid) {
    query = supabase.from('players').select('*').eq('teamid', teamid);
  } else if (playerIds) {
    query = supabase.from('players').select('*').in('steamid64', playerIds);
  }

  let { data: playersData, error } = await query;
  if (error) {
    console.error('💥 Supabase error:', error);
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }

  console.log(`📊 Found ${playersData?.length || 0} players from Supabase`);

  const getSteamAvatar = async (steamid64) => {
    try {
      const steamApiUrl = process.env.STEAM_API_URL;
      const steamApiKey = process.env.STEAM_API_KEY;
      
      if (!steamApiUrl || !steamApiKey) {
        console.warn(`🔧 Steam API não configurada - URL: ${steamApiUrl ? 'OK' : 'MISSING'}, KEY: ${steamApiKey ? 'OK' : 'MISSING'}`);
        return null;
      }

      console.log(`🔍 Buscando avatar para Steam ID: ${steamid64}`);

      // ✅ FETCH OTIMIZADO: Timeout + Headers específicos Steam
      const response = await fetch(
        `${steamApiUrl}?key=${steamApiKey}&steamids=${steamid64}`,
        { 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (compatible; OpServer/1.0; +https://opserver.vercel.app)',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
          },
          // ✅ TIMEOUT específico para Vercel (mais agressivo)
          signal: AbortSignal.timeout(12000), // 12s timeout
        }
      );

      if (!response.ok) {
        console.error(`❌ Steam API falhou: ${response.status} ${response.statusText} para ID ${steamid64}`);
        return null;
      }

      const data = await response.json();
      const avatar = data.response?.players?.[0]?.avatarfull || null;
      
      if (avatar) {
        console.log(`✅ Avatar encontrado: ${avatar}`);
      } else {
        console.warn(`⚠️ Nenhum avatar retornado para Steam ID ${steamid64}. Response:`, data);
      }
      
      return avatar;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`⏰ Timeout na Steam API para ID ${steamid64}`);
      } else {
        console.error(`💥 Erro na Steam API para ID ${steamid64}:`, error.message);
      }
      return null;
    }
  };
  try {
    const playersWithData = await Promise.all(
      playersData.map(async (player) => {
        let avatar = null;
        let configs = null;
        
        if (player.steamid64) {
          // 🔍 Tentar buscar avatar da Steam API
          avatar = await getSteamAvatar(player.steamid64);
          
          // 🎯 FALLBACK: Se Steam API falhar, gerar URL padrão para proxy
          if (!avatar) {
            console.log(`🔄 Steam API falhou para ${player.steamid64}, usando proxy como fallback`);
            // Não definir avatar aqui - deixar que o componente use a estratégia proxy-guess
            // que já está funcionando no frontend
          }
          
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
          avatar, // pode ser null - o frontend vai usar proxy-guess
          configs
        };
      })
    );
    
    console.log(`📊 Retornando ${playersWithData.length} players, avatares encontrados: ${playersWithData.filter(p => p.avatar).length}`);
    
    return NextResponse.json({ data: playersWithData });
  } catch (error) {
    console.error('💥 Erro geral na API players:', error);
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }
}
