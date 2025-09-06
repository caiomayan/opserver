import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { jwtVerify } from 'jose';

async function verifyToken(token) {
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'sua_chave_secreta_super_forte');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    // Usar JWT tokens para autenticação
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(null);
    }
    
    const userData = await verifyToken(token);
    
    if (!userData) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(null);
  }
}

export async function POST(request) {
  try {
    const { steamid64 } = await request.json();

    if (!steamid64) {
      return NextResponse.json({ error: 'SteamID64 is required' }, { status: 400 });
    }

    // Get user data if exists
    const { data: userData, error } = await supabase
      .from('players')
      .select('steamid64, name, idmembership')
      .eq('steamid64', steamid64)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ 
      exists: true,
      data: userData 
    }, { status: 200 });

  } catch (error) {
    console.error('Auth user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
