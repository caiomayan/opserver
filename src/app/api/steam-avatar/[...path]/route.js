import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { path } = await params;
    
    if (!path || path.length === 0) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Reconstrói a URL do avatar Steam
    const avatarPath = Array.isArray(path) ? path.join('/') : path;
    const steamUrl = `https://avatars.steamstatic.com/${avatarPath}`;

    console.log(`Proxying Steam avatar: ${steamUrl}`);

    // Fetch da imagem do Steam
    const response = await fetch(steamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error(`Steam avatar fetch failed: ${response.status} ${response.statusText}`);
      return NextResponse.json({ 
        error: `Failed to fetch avatar: ${response.status}` 
      }, { status: response.status });
    }

    // Converte para buffer
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log(`Avatar fetched successfully: ${steamUrl} (${imageBuffer.byteLength} bytes)`);

    // Retorna a imagem com headers corretos
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=172800', // Cache por 24h
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Steam avatar proxy error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
