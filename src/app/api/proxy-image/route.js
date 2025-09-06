// ✅ ALTERNATIVA MODERNA: Next.js Image Proxy Universal
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 7200; // 2 horas

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    // ✅ SEGURANÇA: Whitelist de domínios permitidos
    const allowedDomains = [
      'avatars.steamstatic.com',
      'steamcdn-a.akamaihd.net',
      'steamuserimages-a.akamaihd.net',
      'cdn.cloudflare.steamstatic.com'
    ];
    
    const imageHost = new URL(imageUrl).hostname;
    if (!allowedDomains.includes(imageHost)) {
      return NextResponse.json({ 
        error: 'Domain not allowed',
        allowedDomains 
      }, { status: 403 });
    }

    console.log(`🔄 Proxying image: ${imageUrl}`);

    // ✅ FETCH OTIMIZADO: Headers específicos por domínio
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; OpServer/1.0)',
      'Accept': 'image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'DNT': '1',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site'
    };

    // ✅ Headers específicos para Steam
    if (imageHost.includes('steam')) {
      headers['Referer'] = 'https://steamcommunity.com/';
      headers['Origin'] = 'https://steamcommunity.com';
    }

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      console.error(`❌ Image fetch failed: ${response.status} for ${imageUrl}`);
      return NextResponse.json({ 
        error: `Image not available: ${response.status}`,
        url: imageUrl 
      }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log(`✅ Image proxied: ${imageUrl} (${imageBuffer.byteLength} bytes)`);

    // ✅ CACHE INTELIGENTE: Diferentes TTLs por tipo
    let cacheControl = 'public, max-age=3600, stale-while-revalidate=7200'; // Default: 1h
    
    // Avatares Steam: cache mais longo (raramente mudam)
    if (imageHost.includes('avatars.steamstatic.com')) {
      cacheControl = 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, immutable';
    }

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'CDN-Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'X-Content-Type-Options': 'nosniff',
        'X-Proxy-Source': imageHost,
        'X-Image-Size': imageBuffer.byteLength.toString(),
        'ETag': `"proxy-${Buffer.from(imageUrl).toString('base64').slice(0, 16)}"`,
        'Vary': 'Accept-Encoding',
      },
    });

  } catch (error) {
    console.error('💥 Image proxy error:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timeout',
        type: 'timeout'
      }, { status: 504 });
    }
    
    return NextResponse.json({ 
      error: 'Proxy error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
