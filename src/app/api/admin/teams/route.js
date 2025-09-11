import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getAdminSession } from '../../../../middleware/adminAuth';

// GET - Listar todos os teams com estatísticas
export async function GET(request) {
  try {
    // Verificar autenticação admin
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select(`
        id,
        name,
        countryid,
        logo,
        created_at,
        updated_at
      `)
      .order('name');

    if (error) {
      console.error('Erro ao buscar teams:', error);
      return NextResponse.json({ error: 'Erro ao buscar teams' }, { status: 500 });
    }

    // Buscar contagem de players por time
    const { data: playerCounts, error: playersError } = await supabaseAdmin
      .from('players')
      .select('teamid')
      .not('teamid', 'is', null);

    const teamPlayerCounts = {};
    if (!playersError && playerCounts) {
      playerCounts.forEach(player => {
        teamPlayerCounts[player.teamid] = (teamPlayerCounts[player.teamid] || 0) + 1;
      });
    }

    // Adicionar contagem de players a cada time
    const teamsWithStats = teams.map(team => ({
      ...team,
      playerCount: teamPlayerCounts[team.id] || 0
    }));

    return NextResponse.json({ 
      success: true, 
      data: teamsWithStats 
    });

  } catch (error) {
    console.error('Erro na API de teams:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// POST - Criar novo time
export async function POST(request) {
  try {
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, countryid, logo } = body;

    // Validações básicas
    if (!id || !name) {
      return NextResponse.json({ 
        error: 'ID e nome são obrigatórios' 
      }, { status: 400 });
    }

    if (id.length >= 10) {
      return NextResponse.json({ 
        error: 'ID deve ter menos de 10 caracteres' 
      }, { status: 400 });
    }

    if (name.length >= 20) {
      return NextResponse.json({ 
        error: 'Nome deve ter menos de 20 caracteres' 
      }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('teams')
      .insert([{
        id: id.toLowerCase().trim(),
        name: name.trim(),
        countryid: countryid ? countryid.toUpperCase().trim() : null,
        logo: logo ? logo.trim() : null
      }])
      .select();

    if (error) {
      console.error('Erro ao criar team:', error);
      let errorMessage = 'Erro ao criar time';
      
      // Tratar erros específicos
      if (error.code === '23505') { // Violação de chave única
        errorMessage = 'Time com este ID já existe';
      } else if (error.code === '23514') {
        if (error.message.includes('teams_name_check')) {
          errorMessage = 'Nome do time inválido (muito longo ou contém caracteres não permitidos)';
        } else if (error.message.includes('teams_id_check')) {
          errorMessage = 'ID do time inválido (deve ter menos de 10 caracteres)';
        } else {
          errorMessage = 'Dados inválidos: ' + error.message;
        }
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: error.code === '23505' ? 409 : 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Time criado com sucesso'
    });

  } catch (error) {
    console.error('Erro na criação de team:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// PUT - Atualizar time
export async function PUT(request) {
  try {
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, countryid, logo } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'ID é obrigatório' 
      }, { status: 400 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (countryid !== undefined) updateData.countryid = countryid ? countryid.toUpperCase().trim() : null;
    if (logo !== undefined) updateData.logo = logo ? logo.trim() : null;

    const { data, error } = await supabaseAdmin
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao atualizar team:', error);
      let errorMessage = 'Erro ao atualizar time';
      
      // Tratar erros específicos
      if (error.code === '23514') {
        if (error.message.includes('teams_name_check')) {
          errorMessage = 'Nome do time inválido (muito longo ou contém caracteres não permitidos)';
        } else {
          errorMessage = 'Dados inválidos: ' + error.message;
        }
      } else if (error.code === '23505') {
        errorMessage = 'Time com esse ID já existe';
      }
      
      return NextResponse.json({ 
        error: errorMessage
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'Time não encontrado' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Time atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro na atualização de team:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// DELETE - Remover time
export async function DELETE(request) {
  try {
    const authResult = await getAdminSession(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    // Tentar obter ID do body ou da query string
    let id;
    try {
      const body = await request.json();
      id = body.id;
    } catch (error) {
      // Se falhar o parsing do JSON, tentar pegar da URL
      const url = new URL(request.url);
      id = url.searchParams.get('id');
    }

    if (!id) {
      return NextResponse.json({ 
        error: 'ID é obrigatório (pode ser enviado no body JSON ou como query parameter ?id=teamid)' 
      }, { status: 400 });
    }

    // Verificar se há players associados
    const { data: players, error: playersError } = await supabaseAdmin
      .from('players')
      .select('steamid64')
      .eq('teamid', id);

    if (playersError) {
      console.error('Erro ao verificar players:', playersError);
      return NextResponse.json({ 
        error: 'Erro ao verificar players associados' 
      }, { status: 500 });
    }

    if (players && players.length > 0) {
      return NextResponse.json({ 
        error: `Não é possível remover o time. Há ${players.length} player(s) associado(s). Remova os players primeiro.` 
      }, { status: 409 });
    }

    const { error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar team:', error);
      return NextResponse.json({ 
        error: 'Erro ao deletar time' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Time removido com sucesso'
    });

  } catch (error) {
    console.error('Erro na remoção de team:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
