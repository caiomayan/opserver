import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const steamApiKey = process.env.STEAM_API_KEY;
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    if (!steamApiKey) {
      return NextResponse.json({ error: 'Steam API key not configured' }, { status: 500 });
    }

    // Construir URL de autenticação Steam
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': `${baseUrl}/api/auth/steam/callback`,
      'openid.realm': baseUrl,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });

    const steamLoginUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;
    
    return NextResponse.redirect(steamLoginUrl);
  } catch (error) {
    console.error('Steam auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
