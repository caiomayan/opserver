import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // URL de teste de um avatar Steam conhecido
    const testAvatarUrl = 'https://avatars.steamstatic.com/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg';
    
    const tests = [];
    
    // Teste 1: Fetch direto do Steam
    try {
      const directResponse = await fetch(testAvatarUrl);
      tests.push({
        test: 'Direct Steam fetch',
        success: directResponse.ok,
        status: directResponse.status,
        contentType: directResponse.headers.get('content-type'),
        size: directResponse.headers.get('content-length'),
      });
    } catch (error) {
      tests.push({
        test: 'Direct Steam fetch',
        success: false,
        error: error.message,
      });
    }

    // Teste 2: Através do nosso proxy
    try {
      const proxyUrl = '/api/steam-avatar/c6054045a49a9c65c2e1d2d5b8c05387934e940a_medium.jpg';
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const fullProxyUrl = `${baseUrl}${proxyUrl}`;
      
      const proxyResponse = await fetch(fullProxyUrl);
      tests.push({
        test: 'Proxy fetch',
        success: proxyResponse.ok,
        status: proxyResponse.status,
        contentType: proxyResponse.headers.get('content-type'),
        size: proxyResponse.headers.get('content-length'),
        url: fullProxyUrl,
      });
    } catch (error) {
      tests.push({
        test: 'Proxy fetch',
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL || 'false',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'undefined',
        VERCEL_URL: process.env.VERCEL_URL || 'undefined',
      },
      tests,
      testAvatarUrl,
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
