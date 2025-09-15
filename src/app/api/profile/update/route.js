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

    // Helper para ignorar string vazia
    function validValue(val) {
      if (val === undefined) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      return val;
    }

    // Campos básicos (excluindo edpi que é coluna gerada)
    if (validValue(configData.sensitivity) !== undefined) configUpdateData.sensitivity = configData.sensitivity;
    if (validValue(configData.dpi) !== undefined) configUpdateData.dpi = configData.dpi;
    if (validValue(configData.hz) !== undefined) configUpdateData.hz = configData.hz;
    if (validValue(configData.crosshair_code) !== undefined) configUpdateData.crosshair_code = configData.crosshair_code;

    // skins: converter para JSON se vier como string
    if (configData.skins !== undefined) {
      if (typeof configData.skins === 'string' && configData.skins.trim() !== '') {
        try {
          configUpdateData.skins = JSON.parse(configData.skins);
        } catch {
          configUpdateData.skins = configData.skins; // salva como string se não for JSON
        }
      } else if (configData.skins !== null) {
        configUpdateData.skins = configData.skins;
      }
    }

    // Campos JSONB: merge com dados antigos
    const jsonbFields = ['mouse_settings', 'video_settings', 'viewmodel_settings', 'hud_settings', 'gear_specs', 'pc_specs'];

    // Verificar se já existe uma configuração para este player
    const { data: existingConfig } = await supabase
      .from('player_configs')
      .select('*')
      .eq('steamid64', steamid64)
      .single();

    for (const field of jsonbFields) {
      if (configData[field] !== undefined) {
        if (existingConfig && existingConfig[field]) {
          // Merge: sobrescreve apenas os campos enviados
          configUpdateData[field] = {
            ...existingConfig[field],
            ...configData[field]
          };
        } else {
          configUpdateData[field] = configData[field];
        }
      }
    }

    if (Object.keys(configUpdateData).length > 0) {
      if (existingConfig) {
        // Atualizar configuração existente
        const { data: updateData, error: configError } = await supabase
          .from('player_configs')
          .update(configUpdateData)
          .eq('steamid64', steamid64);

        console.log('Resultado do update player_configs:', {
          steamid64,
          configUpdateData,
          updateData,
          error: configError
        });

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
