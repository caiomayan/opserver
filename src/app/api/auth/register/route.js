import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { steamid64, name } = await request.json();

    if (!steamid64) {
      return NextResponse.json({ error: 'SteamID64 is required' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('players')
      .select('steamid64, name, idmembership')
      .eq('steamid64', steamid64)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected for new users
      console.error('Error checking existing user:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingUser) {
      // User exists, return existing user data without any updates
      return NextResponse.json({ 
        message: 'User already exists', 
        data: existingUser 
      });
    }

    // User doesn't exist, create new user
    const { data: newUser, error: insertError } = await supabase
      .from('players')
      .insert({
        steamid64,
        name,
        idmembership: 0 // Default to 'Membro' (0)
      })
      .select('steamid64, name, idmembership')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'User created successfully', 
      data: newUser 
    }, { status: 201 });

  } catch (error) {
    console.error('Auth register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
