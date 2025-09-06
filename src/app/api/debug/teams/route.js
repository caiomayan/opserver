import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Teste básico da página teams
    const timestamp = new Date().toISOString();
    
    return NextResponse.json({
      status: 'OK',
      message: 'Teams route working',
      timestamp,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL || 'false',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined',
        STEAM_API_KEY: process.env.STEAM_API_KEY ? 'defined' : 'undefined'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
