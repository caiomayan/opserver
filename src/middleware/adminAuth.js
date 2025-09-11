import { supabase } from '../lib/supabase';
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

export async function checkAdminAuth(steamId) {
  if (!steamId) {
    return { authorized: false, error: 'Steam ID não fornecido' };
  }

  try {
    const { data: player, error } = await supabase
      .from('players')
      .select('steamid64, name, idmembership')
      .eq('steamid64', steamId)
      .single();

    if (error || !player) {
      return { authorized: false, error: 'Player não encontrado' };
    }

    // Verificar se é Dono (idmembership = 3)
    if (player.idmembership !== 3) {
      return { 
        authorized: false, 
        error: 'Acesso negado. Apenas donos podem acessar o painel administrativo.',
        currentMembership: player.idmembership
      };
    }

    return { 
      authorized: true, 
      player: {
        steamid64: player.steamid64,
        name: player.name,
        idmembership: player.idmembership
      }
    };
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return { authorized: false, error: 'Erro interno do servidor' };
  }
}

export async function getAdminSession(req) {
  try {
    // Buscar token JWT nos cookies
    const token = req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { authorized: false, error: 'Sessão não encontrada' };
    }

    // Verificar e decodificar o JWT
    const userData = await verifyToken(token);
    
    if (!userData || !userData.id) {
      return { authorized: false, error: 'Token inválido' };
    }

    // Verificar se o usuário é admin
    return await checkAdminAuth(userData.id);
  } catch (error) {
    console.error('Erro ao verificar sessão admin:', error);
    return { authorized: false, error: 'Erro interno do servidor' };
  }
}
