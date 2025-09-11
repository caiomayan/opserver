import { supabase } from '../../../../lib/supabase';

// PUT - Atualizar perfil próprio
export async function PUT(request) {
  try {
    // Verificar autenticação
    const userRes = await fetch(`${request.url.split('/api')[0]}/api/auth/user`, {
      headers: request.headers,
      credentials: 'include'
    });

    if (!userRes.ok) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const currentUser = await userRes.json();
    if (!currentUser?.id) {
      return Response.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const body = await request.json();
    const { steamid64, birthday, gamersclubid, ...configData } = body;

    // Verificar se o usuário está editando apenas seu próprio perfil
    if (steamid64 !== currentUser.id) {
      return Response.json({ error: 'Você só pode editar seu próprio perfil' }, { status: 403 });
    }

    // Atualizar dados pessoais na tabela players
    const playerUpdateData = {};
    if (birthday !== undefined) playerUpdateData.birthday = birthday;
    if (gamersclubid !== undefined) playerUpdateData.gamersclubid = gamersclubid;

    if (Object.keys(playerUpdateData).length > 0) {
      const { error: playerError } = await supabase
        .from('players')
        .update(playerUpdateData)
        .eq('steamid64', steamid64);

      if (playerError) {
        console.error('Erro ao atualizar player:', playerError);
        return Response.json({ error: 'Erro ao atualizar informações pessoais' }, { status: 500 });
      }
    }

    // Atualizar configurações na tabela player_configs
    const configUpdateData = {};

    // Campos básicos (excluindo edpi que é coluna gerada)
    if (configData.sensitivity !== undefined) configUpdateData.sensitivity = configData.sensitivity || null;
    if (configData.dpi !== undefined) configUpdateData.dpi = configData.dpi || null;
    // edpi é calculado automaticamente pelo banco, não incluir
    if (configData.hz !== undefined) configUpdateData.hz = configData.hz || null;
    if (configData.crosshair_code !== undefined) configUpdateData.crosshair_code = configData.crosshair_code || null;
    if (configData.skins !== undefined) configUpdateData.skins = configData.skins || null;

    // Campos JSONB
    if (configData.mouse_settings) configUpdateData.mouse_settings = configData.mouse_settings;
    if (configData.video_settings) configUpdateData.video_settings = configData.video_settings;
    if (configData.viewmodel_settings) configUpdateData.viewmodel_settings = configData.viewmodel_settings;
    if (configData.hud_settings) configUpdateData.hud_settings = configData.hud_settings;
    if (configData.gear_specs) configUpdateData.gear_specs = configData.gear_specs;
    if (configData.pc_specs) configUpdateData.pc_specs = configData.pc_specs;

    if (Object.keys(configUpdateData).length > 0) {
      // Verificar se já existe uma configuração para este player
      const { data: existingConfig } = await supabase
        .from('player_configs')
        .select('id')
        .eq('steamid64', steamid64)
        .single();

      if (existingConfig) {
        // Atualizar configuração existente
        const { error: configError } = await supabase
          .from('player_configs')
          .update(configUpdateData)
          .eq('steamid64', steamid64);

        if (configError) {
          console.error('Erro ao atualizar config:', configError);
          return Response.json({ error: 'Erro ao atualizar configurações' }, { status: 500 });
        }
      } else {
        // Criar nova configuração
        const { error: configError } = await supabase
          .from('player_configs')
          .insert({
            steamid64,
            ...configUpdateData
          });

        if (configError) {
          console.error('Erro ao criar config:', configError);
          return Response.json({ error: 'Erro ao criar configurações' }, { status: 500 });
        }
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Perfil atualizado com sucesso' 
    });

  } catch (error) {
    console.error('Erro na API de atualização de perfil:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
