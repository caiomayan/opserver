// API route para resolver vanityURL para steamid64 sem expor a chave
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL não informada.' }, { status: 400 });

    // Extrai vanity ou steamid64 do link
    const matchId = url.match(/steamcommunity\.com\/id\/([^\/]+)/);
    const matchProfile = url.match(/steamcommunity\.com\/profiles\/(\d+)/);
    let vanity = '';
    if (matchId) vanity = matchId[1];
    else if (matchProfile) vanity = matchProfile[1];
    else vanity = url;

    // Se já for um steamid64, retorna direto
    if (/^\d{17}$/.test(vanity)) {
      return NextResponse.json({ steamid64: vanity });
    }

    // Chave da API do .env
    const steamApiKey = process.env.STEAM_API_KEY;
    if (!steamApiKey) return NextResponse.json({ error: 'STEAM_API_KEY não configurada.' }, { status: 500 });

    // Chama endpoint da Steam
    const endpoint = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApiKey}&vanityurl=${vanity}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data?.response?.success === 1 && data.response.steamid) {
      return NextResponse.json({ steamid64: data.response.steamid });
    }
    return NextResponse.json({ error: 'Não foi possível resolver o SteamID64.' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
