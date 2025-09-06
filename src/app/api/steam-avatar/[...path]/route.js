import { NextResponse } from 'next/server';

// ✅ SOLUÇÃO MODERNA: Proxy otimizado para Vercel
export const runtime = 'nodejs'; // Force Node.js runtime (mais estável que Edge)
export const revalidate = 3600; // Cache por 1 hora

export async function GET(request, { params }) {
  try {
    const { path } = await params;
    
    if (!path || path.length === 0) {
      console.error('❌ Path is required');
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Reconstrói a URL do avatar Steam
    const avatarPath = Array.isArray(path) ? path.join('/') : path;
    const steamUrl = `https://avatars.steamstatic.com/${avatarPath}`;

    console.log(`🔄 Proxying Steam avatar: ${steamUrl}`);

    // ✅ ESTRATÉGIA MODERNA: Headers otimizados para Steam + Vercel
    const steamResponse = await fetch(steamUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OpServer/1.0; +https://opserver.vercel.app)',
        'Accept': 'image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://steamcommunity.com/',
        'Origin': 'https://steamcommunity.com',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      // ✅ TIMEOUT para evitar hanging no Vercel
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!steamResponse.ok) {
      console.error(`❌ Steam fetch failed: ${steamResponse.status} ${steamResponse.statusText}`);
      
      // ✅ FALLBACK: Retorna avatar padrão em caso de erro
      const fallbackResponse = await fetch('https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg');
      if (fallbackResponse.ok) {
        const fallbackBuffer = await fallbackResponse.arrayBuffer();
        return new Response(fallbackBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600', // Cache menor para fallback
            'X-Fallback': 'true'
          },
        });
      }
      
      return NextResponse.json({ 
        error: `Steam avatar not available: ${steamResponse.status}` 
      }, { status: steamResponse.status });
    }

    // ✅ PERFORMANCE: Stream direto sem buffer intermediário
    const imageBuffer = await steamResponse.arrayBuffer();
    const contentType = steamResponse.headers.get('content-type') || 'image/jpeg';
    
    console.log(`✅ Avatar fetched: ${steamUrl} (${imageBuffer.byteLength} bytes, ${contentType})`);

    // ✅ HEADERS MODERNOS: Cache otimizado + CORS + Vercel-friendly
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // ✅ Cache agressivo para avatares (raramente mudam)
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, immutable',
        'CDN-Cache-Control': 'public, max-age=86400',
        'Vercel-CDN-Cache-Control': 'public, max-age=86400',
        // ✅ CORS otimizado
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
        'Access-Control-Max-Age': '86400',
        // ✅ Headers de otimização
        'X-Content-Type-Options': 'nosniff',
        'X-Proxy-Source': 'steam-avatars',
        'X-Cache-Status': 'MISS',
        'Vary': 'Accept-Encoding',
        // ✅ Performance headers
        'ETag': `"steam-${avatarPath.replace(/[^a-zA-Z0-9]/g, '')}"`,
        'Last-Modified': new Date().toUTCString(),
      },
    });

  } catch (error) {
    console.error('💥 Steam avatar proxy error:', error);
    
    // ✅ TIMEOUT ou NETWORK ERROR: Return minimal error
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json({ 
        error: 'Request timeout - Steam servers too slow',
        type: 'timeout'
      }, { status: 504 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      type: 'server_error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ✅ PERFORMANCE: Suporte ao HEAD request (para verificações)
export async function HEAD(request, { params }) {
  try {
    const { path } = await params;
    const avatarPath = Array.isArray(path) ? path.join('/') : path;
    const steamUrl = `https://avatars.steamstatic.com/${avatarPath}`;
    
    const response = await fetch(steamUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    return new Response(null, {
      status: response.ok ? 200 : 404,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'X-Avatar-Available': response.ok ? 'true' : 'false'
      }
    });
  } catch (error) {
    return new Response(null, { status: 404 });
  }
}

// ✅ CORS Preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
      'Access-Control-Max-Age': '86400',
    },
  });
}
