import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PLAYERS_FILE = path.join(process.cwd(), 'data', 'players.json');

export async function GET() {
  try {
    // Ler arquivo de jogadores
    let players = [];
    try {
      const fileContent = fs.readFileSync(PLAYERS_FILE, 'utf8');
      players = JSON.parse(fileContent);
    } catch (error) {
      console.log('Arquivo players.json não encontrado');
      players = [];
    }
    
    return NextResponse.json({ 
      success: true, 
      players: players 
    });
    
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar jogadores' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, player, originalName } = await request.json();
    
    // Ler arquivo atual
    let players = [];
    try {
      const fileContent = fs.readFileSync(PLAYERS_FILE, 'utf8');
      players = JSON.parse(fileContent);
    } catch (error) {
      console.log('Arquivo não encontrado, criando novo array');
      // Criar diretório data se não existir
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }
    
    // Limpar campos vazios (converter strings vazias em null)
    const cleanPlayerData = cleanEmptyFields(player);
    
    if (action === 'update') {
      // Atualizar jogador existente
      const existingIndex = players.findIndex(p => p.nome === originalName);
      if (existingIndex >= 0) {
        players[existingIndex] = cleanPlayerData;
      } else {
        return NextResponse.json(
          { success: false, message: 'Jogador não encontrado para atualização' },
          { status: 404 }
        );
      }
    } else if (action === 'create') {
      // Verificar se já existe jogador com mesmo nome
      const existingPlayer = players.find(p => p.nome === cleanPlayerData.nome);
      if (existingPlayer) {
        return NextResponse.json(
          { success: false, message: 'Já existe um jogador com este nome' },
          { status: 400 }
        );
      }
      // Adicionar novo jogador
      players.push(cleanPlayerData);
    }
    
    // Salvar no arquivo
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: action === 'update' ? 'Jogador atualizado com sucesso!' : 'Jogador adicionado com sucesso!' 
    });
    
  } catch (error) {
    console.error('Erro ao salvar jogador:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao salvar jogador' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { nome } = await request.json();
    
    // Ler arquivo atual
    const fileContent = fs.readFileSync(PLAYERS_FILE, 'utf8');
    let players = JSON.parse(fileContent);
    
    // Remover jogador
    const initialLength = players.length;
    players = players.filter(p => p.nome !== nome);
    
    if (players.length === initialLength) {
      return NextResponse.json(
        { success: false, message: 'Jogador não encontrado' },
        { status: 404 }
      );
    }
    
    // Salvar no arquivo
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Jogador removido com sucesso!' 
    });
    
  } catch (error) {
    console.error('Erro ao remover jogador:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao remover jogador' },
      { status: 500 }
    );
  }
}

// Função para limpar campos vazios
function cleanEmptyFields(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanEmptyFields);
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.trim() === '') {
        cleaned[key] = null;
      } else {
        cleaned[key] = cleanEmptyFields(value);
      }
    }
    return cleaned;
  }
  return obj;
}
