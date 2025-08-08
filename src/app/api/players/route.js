import { NextResponse } from 'next/server';
import playersData from '../../../../data/players.json';

export async function GET() {
  const getPlayerLevel = async (playerId) => {
    try {
      // Desabilitar scraping do GamersClub em produção (Vercel não suporta Puppeteer)
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        // Retornar levels baseados nos IDs reais dos jogadores
        const levelMap = {
          '1635730': 17, // tensai
          '2319357': 19, // henry
          '1808995': 15, // renan
          '2345889': 13, // astro
          'FalleN': 99,  // FalleN (pro player)
          '': 'Indisponível' // players sem gamersclubid
        };
        return levelMap[playerId] || 'Indisponível';
      }
      
      // Para desenvolvimento local, tentar usar a API original
      const GC = require('gamersclub-api');
      const gc = new GC(
        process.env.GAMERSCLUB_API_KEY,
        process.env.GAMERSCLUB_BASE_URL
      );
      await gc.initBrowser();
      
      const level = await new Promise((resolve) => {
        gc.responseData(`player/${playerId}`, 'body', function() {
          const element = document.querySelector('.badge-level') || document.querySelector('.badge-level-value');
          const level = element ? element.innerText || element.textContent : null;
          return { level };
        }).then(data => {
          resolve(parseInt(data.level) || 'Indisponível');
        }).catch(() => {
          resolve('Indisponível');
        });
      });
      
      await gc.closeBrowser();
      return level;
    } catch (error) {
      console.log(`❌ Error fetching ${playerId}:`, error);
      return 'Indisponível';
    }
  };

  const getSteamAvatar = async (steamid64) => {
    try {
      const steamApiUrl = process.env.STEAM_API_URL;
      const steamApiKey = process.env.STEAM_API_KEY;
      
      if (!steamApiUrl || !steamApiKey) {
        console.log('❌ Steam API credentials missing');
        return null;
      }

      const response = await fetch(
        `${steamApiUrl}?key=${steamApiKey}&steamids=${steamid64}`
      );
      
      if (!response.ok) {
        console.log(`❌ Steam API response not ok: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data.response?.players?.[0]?.avatarfull || null;
    } catch (error) {
      console.log(`❌ Error fetching Steam avatar for ${steamid64}:`, error);
      return null;
    }
  };

  try {
    const playersWithData = await Promise.all(
      playersData.map(async (player) => {
        const [level, avatar] = await Promise.all([
          getPlayerLevel(player.gamersclubid),
          getSteamAvatar(player.steamid64)
        ]);

        return {
          ...player,
          level,
          avatar
        };
      })
    );

    return NextResponse.json(playersWithData);
    
  } catch (error) {
    const playersWithError = playersData.map(player => ({
      ...player,
      level: "?",
      avatar: null
    }));
    
    return NextResponse.json(playersWithError);
  }
}
