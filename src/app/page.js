import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";

export default async function Home() {
  let players = [];

  try {
    const res = await fetch('http://localhost:3000/api/players', {cache: 'no-store'});
    players = res.ok ? await res.json() : [];
  } catch (error) {
    console.log('Erro ao buscar dados:', error.message);
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative">
      {/* Header posicionado absolutamente para não afetar o centro */}
      <header className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <img src="/logo.svg"
        alt="OPIUM Logo" 
        className="mx-auto"
        width="40"
        height="40" />
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-wrap justify-center gap-8">
            {players.map((player) => (
              <Link 
                key={player.steamid64} 
                href={`/player/${player.name.toLowerCase()}`}
                className="group relative block cursor-pointer"
              >
                {/* Avatar principal - sempre visível */}
                <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 z-20 relative group-hover:scale-110">
                  {player.avatar ? (
                    <img 
                      src={player.avatar} 
                      alt={`Avatar de ${player.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-3xl font-bold">?</span>
                    </div>
                  )}
                </div>
                
                {/* Informações que aparecem embaixo do avatar */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4
                              bg-white px-4 py-2 rounded-lg shadow-xl border border-gray-200 
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                              transition-all duration-300 scale-95 group-hover:scale-100 
                              z-10 whitespace-nowrap">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-800">{player.name}</h2>
                      <ReactCountryFlag countryCode={player.country} svg style={{width: '1.2em', height: '1.2em'}} />
                    </div>
                    {player.level && player.level !== 'Indisponível' && player.level !== '?' && typeof player.level === 'number' && (
                      <>
                        <p className="text-sm font-medium text-gray-500">LEVEL {player.level}</p>
                        <p className="text-xs text-gray-400">GAMERSCLUB</p>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {players.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando jogadores...</p>
            </div>
          )}
        </div>
      
      {/* Rodapé fixo no final da tela */}
      <footer className="fixed bottom-0 left-0 right-0 text-center py-2">
        <p className="text-xs text-gray-400">Development</p>
      </footer>
    </div>
  )
}
