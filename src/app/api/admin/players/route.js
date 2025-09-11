import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getAdminSession } from '../../../../middleware/adminAuth';

// Função para buscar avatar Steam (mesma lógica da API pública)
const getSteamAvatar = async (steamid64) => {
  try {
    const steamApiUrl = process.env.STEAM_API_URL;
    const steamApiKey = process.env.STEAM_API_KEY;
    
    if (!steamApiUrl || !steamApiKey) {
      return null;
    }

    const response = await fetch(
      `${steamApiUrl}?key=${steamApiKey}&steamids=${steamid64}`,
      { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (compatible; OpServer/1.0)',
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.response?.players?.[0]?.avatarfull || null;
  } catch (error) {
    return null;
  }
};

// GET - Listar todos os players
export async function GET(request) {
  try {
    // Verificar autenticação admin
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { data: players, error } = await supabaseAdmin
      .from('players')
      .select(`
        steamid64,
        name,
        country,
        birthday,
        gamersclubid,
        teamid,
        idrole,
        idmembership,
        created_at,
        updated_at,
        benched,
        teams:teamid (
          id,
          name
        )
      `)
      .order('name');

    if (error) {
      console.error('Erro ao buscar players:', error);
      return NextResponse.json({ error: 'Erro ao buscar players' }, { status: 500 });
    }

    // Buscar avatares para cada player (usando mesma lógica da API pública)
    const playersWithAvatars = await Promise.all(
      players.map(async (player) => {
        let avatar = null;
        
        if (player.steamid64) {
          avatar = await getSteamAvatar(player.steamid64);
        }
        
        return {
          ...player,
          team_name: player.teams?.name || null,
          avatar: avatar
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: playersWithAvatars 
    });

  } catch (error) {
    console.error('Erro na API de players:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// POST - Criar novo player
export async function POST(request) {
  try {
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      steamid64,
      name,
      country,
      birthday,
      gamersclubid,
      teamid,
      idrole,
      idmembership,
      benched
    } = body;

    // Validações básicas
    if (!steamid64 || !name || !country) {
      return NextResponse.json({ 
        error: 'Steam ID, nome e país são obrigatórios' 
      }, { status: 400 });
    }

    if (name.length > 10) {
      return NextResponse.json({ 
        error: 'Nome deve ter no máximo 10 caracteres' 
      }, { status: 400 });
    }

    if (country.length > 3) {
      return NextResponse.json({ 
        error: 'País deve ter no máximo 3 caracteres' 
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('players')
      .insert([{
        steamid64,
        name,
        country: country.toUpperCase(),
        birthday: birthday || null,
        gamersclubid: gamersclubid || null,
        teamid: teamid || null,
        idrole: parseInt(idrole) || 0,
        idmembership: parseInt(idmembership) || 0,
        benched: Boolean(benched)
      }])
      .select();

    if (error) {
      console.error('Erro ao criar player:', error);
      
      if (error.code === '23505') { // Violação de chave única
        return NextResponse.json({ 
          error: 'Player com este Steam ID ou Gamers Club ID já existe' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: 'Erro ao criar player' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Player criado com sucesso'
    });

  } catch (error) {
    console.error('Erro na criação de player:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// PUT - Atualizar player
export async function PUT(request) {
  try {
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      steamid64,
      name,
      country,
      birthday,
      gamersclubid,
      teamid,
      idrole,
      idmembership,
      benched
    } = body;

    if (!steamid64) {
      return NextResponse.json({ 
        error: 'Steam ID é obrigatório' 
      }, { status: 400 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (country !== undefined) updateData.country = country.toUpperCase();
    if (birthday !== undefined) updateData.birthday = birthday || null;
    if (gamersclubid !== undefined) updateData.gamersclubid = gamersclubid || null;
    if (teamid !== undefined) updateData.teamid = teamid || null;
    if (idrole !== undefined) updateData.idrole = parseInt(idrole);
    if (idmembership !== undefined) updateData.idmembership = parseInt(idmembership);
    if (benched !== undefined) updateData.benched = Boolean(benched);

    const { data, error } = await supabaseAdmin
      .from('players')
      .update(updateData)
      .eq('steamid64', steamid64)
      .select();

    if (error) {
      console.error('Erro ao atualizar player:', error);
      return NextResponse.json({ 
        error: 'Erro ao atualizar player' 
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'Player não encontrado' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Player atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro na atualização de player:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// DELETE - Remover player
export async function DELETE(request) {
  try {
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const body = await request.json();
    const { steamid64 } = body;

    if (!steamid64) {
      return NextResponse.json({ 
        error: 'Steam ID é obrigatório' 
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('players')
      .delete()
      .eq('steamid64', steamid64);

    if (error) {
      console.error('Erro ao deletar player:', error);
      return NextResponse.json({ 
        error: 'Erro ao deletar player' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Player removido com sucesso'
    });

  } catch (error) {
    console.error('Erro na remoção de player:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
