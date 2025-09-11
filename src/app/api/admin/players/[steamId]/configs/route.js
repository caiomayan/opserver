import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '../../../../../../lib/supabase';

// GET - Buscar configurações do jogador
export async function GET(request, { params }) {
  try {
    const { steamId } = await params;

    // Primeiro, tentar buscar da tabela player_configs usando cliente admin
    const { data: playerConfig, error: configError } = await supabaseAdmin
      .from('player_configs')
      .select('*')
      .eq('steamid64', steamId)
      .single();

    // Se não encontrar, buscar da tabela players (campos JSONB)
    let configs = {};
    if (configError && configError.code === 'PGRST116') {
      const { data: playerData, error: playerError } = await supabaseAdmin
        .from('players')
        .select('sensitivity, dpi, hz, mouse_settings, video_settings, viewmodel_settings, hud_settings, crosshair_code, skins, gear_specs, pc_specs')
        .eq('steamid64', steamId)
        .single();

      if (playerError || !playerData) {
        console.error('Erro ao buscar dados do jogador:', playerError);
        return NextResponse.json({ 
          message: 'Configurações não encontradas',
          configs: {}
        }, { status: 404 });
      }

      // Usar dados da tabela players como fallback
      configs = {
        steamid64: steamId,
        sensitivity: playerData.sensitivity || null,
        dpi: playerData.dpi || null,
        edpi: playerData.sensitivity && playerData.dpi ? playerData.sensitivity * playerData.dpi : null,
        hz: playerData.hz || null,
        mouse_settings: playerData.mouse_settings || {},
        video_settings: playerData.video_settings || {},
        viewmodel_settings: playerData.viewmodel_settings || {},
        hud_settings: playerData.hud_settings || {},
        crosshair_code: playerData.crosshair_code || null,
        skins: playerData.skins || {},
        gear_specs: playerData.gear_specs || {},
        pc_specs: playerData.pc_specs || {}
      };

    } else if (configError) {
      console.error('Erro ao buscar configurações:', configError);
      return NextResponse.json({ 
        error: 'Erro interno do servidor', 
        details: configError.message 
      }, { status: 500 });
    } else {
      // Dados encontrados na tabela player_configs
      configs = playerConfig;
    }

    return NextResponse.json({
      message: 'Configurações encontradas',
      configs: configs
    });

  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Atualizar configurações do jogador
export async function PUT(request, { params }) {
  try {
    const { steamId } = await params;
    const body = await request.json();

    console.log('PUT Configurações - SteamID:', steamId);
    console.log('PUT Configurações - Body:', body);

    // Verificar se já existe configuração
    const { data: existingConfig, error: checkError } = await supabaseAdmin
      .from('player_configs')
      .select('*')
      .eq('steamid64', steamId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar configuração existente:', checkError);
      return NextResponse.json({ 
        error: 'Erro ao verificar dados existentes', 
        details: checkError.message 
      }, { status: 500 });
    }

    // Calcular valores, mas NÃO incluir EDPI pois é campo GENERATED
    const dpi = body.dpi !== undefined ? body.dpi : null;
    const sensitivity = body.sensitivity !== undefined ? body.sensitivity : null;

    let result;
    if (existingConfig) {
      // Atualizar configuração existente - MERGE dos campos JSONB
      const { data, error } = await supabaseAdmin
        .from('player_configs')
        .update({
          sensitivity: sensitivity !== null ? sensitivity : existingConfig.sensitivity,
          dpi: dpi !== null ? dpi : existingConfig.dpi,
          hz: body.hz !== undefined ? body.hz : existingConfig.hz,
          // NÃO incluir 'edpi' - é campo GENERATED ALWAYS AS
          // MERGE dos campos JSONB preservando dados existentes
          mouse_settings: {
            ...(existingConfig.mouse_settings || {}),
            ...(body.mouse_settings || {})
          },
          video_settings: {
            ...(existingConfig.video_settings || {}),
            ...(body.video_settings || {})
          },
          viewmodel_settings: {
            ...(existingConfig.viewmodel_settings || {}),
            ...(body.viewmodel_settings || {})
          },
          hud_settings: {
            ...(existingConfig.hud_settings || {}),
            ...(body.hud_settings || {})
          },
          crosshair_code: body.crosshair_code !== undefined ? body.crosshair_code : existingConfig.crosshair_code,
          skins: {
            ...(existingConfig.skins || {}),
            ...(body.skins || {})
          },
          gear_specs: {
            ...(existingConfig.gear_specs || {}),
            ...(body.gear_specs || {})
          },
          pc_specs: {
            ...(existingConfig.pc_specs || {}),
            ...(body.pc_specs || {})
          }
        })
        .eq('steamid64', steamId)
        .select();

      result = { data, error };
    } else {
      // Criar nova configuração
      const { data, error } = await supabaseAdmin
        .from('player_configs')
        .insert({
          steamid64: steamId,
          sensitivity: sensitivity,
          dpi: dpi,
          hz: body.hz || null,
          // NÃO incluir 'edpi' - é campo GENERATED ALWAYS AS calculado automaticamente
          mouse_settings: body.mouse_settings || {},
          video_settings: body.video_settings || {},
          viewmodel_settings: body.viewmodel_settings || {},
          hud_settings: body.hud_settings || {},
          crosshair_code: body.crosshair_code || null,
          skins: body.skins || {},
          gear_specs: body.gear_specs || {},
          pc_specs: body.pc_specs || {}
        })
        .select();

      result = { data, error };
    }

    if (result.error) {
      console.error('Erro ao salvar configurações:', result.error);
      return NextResponse.json({ 
        error: 'Erro ao salvar configurações', 
        details: result.error.message 
      }, { status: 500 });
    }

    console.log('Configurações salvas com sucesso:', result.data);

    return NextResponse.json({
      message: existingConfig ? 'Configurações atualizadas com sucesso' : 'Configurações criadas com sucesso',
      configs: result.data ? (Array.isArray(result.data) ? result.data[0] : result.data) : null
    });

  } catch (error) {
    console.error('Erro inesperado no PUT:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Deletar configurações do jogador
export async function DELETE(request, { params }) {
  try {
    const { steamId } = await params;

    console.log('DELETE Configurações - SteamID:', steamId);

    const { data, error } = await supabaseAdmin
      .from('player_configs')
      .delete()
      .eq('steamid64', steamId)
      .select();

    if (error) {
      console.error('Erro ao deletar configurações:', error);
      return NextResponse.json({ 
        error: 'Erro ao deletar configurações', 
        details: error.message 
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhuma configuração encontrada para deletar' 
      }, { status: 404 });
    }

    console.log('Configurações deletadas com sucesso:', data);

    return NextResponse.json({
      message: 'Configurações deletadas com sucesso',
      deleted: data[0]
    });

  } catch (error) {
    console.error('Erro inesperado no DELETE:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}