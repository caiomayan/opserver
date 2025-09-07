import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 🔍 DEBUG: Verificar todas as environment variables importantes
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || 'false',
      VERCEL_ENV: process.env.VERCEL_ENV,
      
      // Steam API
      STEAM_API_URL: process.env.STEAM_API_URL ? 'DEFINED' : 'MISSING',
      STEAM_API_KEY: process.env.STEAM_API_KEY ? 'DEFINED' : 'MISSING',
      STEAM_API_KEY_LENGTH: process.env.STEAM_API_KEY?.length || 0,
      
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINED' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINED' : 'MISSING',
      
      // Auth
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'DEFINED' : 'MISSING',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'DEFINED' : 'MISSING',
    };

    // 🧪 Teste básico da Steam API se as vars estão definidas
    let steamTest = null;
    if (process.env.STEAM_API_URL && process.env.STEAM_API_KEY) {
      try {
        const testSteamId = '76561198000000000'; // Steam ID de teste
        const response = await fetch(
          `${process.env.STEAM_API_URL}?key=${process.env.STEAM_API_KEY}&steamids=${testSteamId}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; OpServer/1.0)',
            },
            signal: AbortSignal.timeout(10000),
          }
        );
        
        steamTest = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: {
            'content-type': response.headers.get('content-type'),
            'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
          }
        };

        if (response.ok) {
          const data = await response.json();
          steamTest.hasPlayers = !!data.response?.players?.length;
          steamTest.playersCount = data.response?.players?.length || 0;
        }
      } catch (error) {
        steamTest = {
          error: error.message,
          name: error.name,
        };
      }
    }

    return NextResponse.json({
      status: 'OK',
      message: 'Environment debug info',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      steamApiTest: steamTest,
    });

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
