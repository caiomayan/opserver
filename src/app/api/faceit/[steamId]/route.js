import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { steamId } = await params;

    if (!steamId) {
      return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 });
    }

    if (!process.env.FACEIT_API_KEY) {
      return NextResponse.json({ error: 'FACEIT API key not configured' }, { status: 500 });
    }

    // Buscar jogador na FACEIT usando Steam ID
    const response = await fetch(`https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.FACEIT_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Player not found on FACEIT' }, { status: 404 });
      }
      throw new Error(`FACEIT API error: ${response.status}`);
    }

    const data = await response.json();

    // Extrair informações relevantes
    const faceitData = {
      nickname: data.nickname,
      level: data.games?.cs2?.skill_level || 0,
      elo: data.games?.cs2?.faceit_elo || 0,
      region: data.region,
      country: data.country,
      avatar: data.avatar,
      profile_url: `https://www.faceit.com/en/players/${data.nickname}`
    };

    return NextResponse.json(faceitData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // Cache por 5 minutos
      }
    });

  } catch (error) {
    console.error('FACEIT API error:', error);
    return NextResponse.json({ error: 'Failed to fetch FACEIT data' }, { status: 500 });
  }
}
