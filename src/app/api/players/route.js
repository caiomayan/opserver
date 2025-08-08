import { NextResponse } from 'next/server';
import playersData from '../../../../data/players.json';

export async function GET() {
  const getPlayerLevel = async (playerId) => {
    try {
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
      const response = await fetch(
        `${process.env.STEAM_API_URL}/?key=${process.env.STEAM_API_KEY}&steamids=${steamid64}`
      );
      const data = await response.json();
      return data.response.players[0]?.avatarfull || null;
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
