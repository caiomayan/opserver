import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// Função para verificar a autenticação Steam OpenID
async function verifySteamOpenID(query) {
  try {
    const params = new URLSearchParams();
    
    // Copiar todos os parâmetros exceto mode
    Object.keys(query).forEach(key => {
      if (key !== 'openid.mode') {
        params.append(key, query[key]);
      }
    });
    
    // Definir mode como check_authentication
    params.append('openid.mode', 'check_authentication');
    
    // Verificar com Steam
    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    const result = await response.text();
    return result.includes('is_valid:true');
  } catch (error) {
    console.error('Steam verification error:', error);
    return false;
  }
}

// Função para extrair Steam ID da resposta
function extractSteamId(identity) {
  const match = identity.match(/\/id\/(\d+)$/);
  return match ? match[1] : null;
}

// Função para buscar dados do usuário Steam
async function getSteamUserData(steamId) {
  try {
    const steamApiKey = process.env.STEAM_API_KEY;
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    const data = await response.json();
    return data.response.players[0] || null;
  } catch (error) {
    console.error('Steam API error:', error);
    return null;
  }
}

// Função para criar JWT
async function createJWT(userData) {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'sua_chave_secreta_super_forte');
  
  // Criar estrutura compatível com passport-steam
  const jwt = await new SignJWT({
    id: userData.steamid,
    displayName: userData.personaname,
    photos: [{ value: userData.avatarmedium }],
    avatar: {
      medium: userData.avatarmedium
    },
    personaname: userData.personaname,
    name: userData.personaname,
    _json: userData
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
    
  return jwt;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams.entries());
    
    // Verificar se a autenticação Steam é válida
    const isValid = await verifySteamOpenID(query);
    
    if (!isValid) {
      console.error('Steam authentication failed');
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }
    
    // Extrair Steam ID
    const steamId = extractSteamId(query['openid.identity']);
    
    if (!steamId) {
      console.error('Could not extract Steam ID');
      return NextResponse.redirect(new URL('/?error=no_steam_id', request.url));
    }
    
    // Buscar dados do usuário
    const userData = await getSteamUserData(steamId);
    
    if (!userData) {
      console.error('Could not fetch Steam user data');
      return NextResponse.redirect(new URL('/?error=no_user_data', request.url));
    }
    
    // Criar JWT
    const token = await createJWT(userData);
    
    // Criar resposta com cookie
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = NextResponse.redirect(new URL('/', baseUrl));
    
    // Definir cookie com JWT
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    });
    
    return response;
  } catch (error) {
    console.error('Steam callback error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}
