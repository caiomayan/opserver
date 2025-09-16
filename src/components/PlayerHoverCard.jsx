import React from 'react';
import Link from 'next/link';
import CountryFlag from './CountryFlag';
import SimpleSteamAvatar from './SimpleSteamAvatar';
import { isValidLevel, calculateAge } from '../utils/playerUtils';
import { getRoleIcon } from '../utils/playerRoles';
import { useFaceitData } from '../hooks/useFaceitData';

export default function PlayerHoverCard({ player }) {
  const age = calculateAge(player.birthday);
  const { faceitData } = useFaceitData(player.steamid64);
  return (
    <Link 
      key={player.steamid64} 
      href={`/player/${player.steamid64}`}
      className="group relative transition-transform duration-200 ease-in-out hover:scale-110"
    >
      {/* Player Circle */}
      <SimpleSteamAvatar 
        src={player.avatar}
        alt={`Avatar de ${player.name}`}
        size="w-26 h-26"
        className="shadow-xl group-hover:shadow-2xl transition-shadow duration-200"
        fallbackInitial={player.name.charAt(0).toUpperCase()}
      />
      {/* Hover Card - Design equilibrado */}
  <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 
        bg-white border border-gray-200 rounded-lg shadow-md
        px-3 py-2 inline-block
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-200 pointer-events-none z-50">
        <div className="text-center space-y-1.5">
          {/* Nome do player */}
          <div className="flex items-center justify-center gap-1 font-medium text-gray-900 text-sm leading-tight whitespace-nowrap">
            <span>{player.name}</span>
            {player.benched === true && (
              <span className="text-gray-400 text-xs font-normal flex-shrink-0">B</span>
            )}
          </div>
          {/* Bandeira em linha separada */}
          <div className="flex justify-center">
            <CountryFlag 
              countryCode={player.country} 
              size="w-4 h-3"
              flagSize={40}
            />
          </div>
          {/* Ícone da role + Faceit logo dinâmico */}
          <div className="flex justify-center gap-1 items-center">
            {/* Faceit level logo, se existir */}
            {faceitData && faceitData.level > 0 && (
              <img
                src={`/platforms/faceit-levels/skill_level_${faceitData.level === 10 ? 'max' : faceitData.level}.png`}
                alt={`FACEIT Level ${faceitData.level}`}
                className="w-4 h-4"
                title={`FACEIT Level ${faceitData.level}`}
              />
            )}
            <img 
              src={getRoleIcon(player.idrole)} 
              alt="Role"
              className="w-4 h-4"
            />
          </div>
          {isValidLevel(player.level) && (
            <div className="text-xs text-gray-600 font-medium">
              GC {player.level}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
