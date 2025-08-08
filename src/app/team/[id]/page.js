import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";

export default async function TeamPage({ params }) {
  const { id } = await params;
  
  let players = [];
  let teamData = null;

  try {
    const [playersRes, teamsRes] = await Promise.all([
      fetch('http://localhost:3000/api/players', {cache: 'no-store'}),
      fetch('http://localhost:3000/api/teams', {cache: 'no-store'})
    ]);
    
    if (playersRes.ok) {
      const allPlayers = await playersRes.json();
      
      if (teamsRes.ok) {
        const teams = await teamsRes.json();
        teamData = teams.find(team => team.id === id);
        
        if (teamData) {
          // Filtrar jogadores do time
          players = allPlayers.filter(player => player.teamId === teamData.id);
        }
      }
    }
  } catch (error) {
    console.log('Erro ao buscar dados:', error.message);
  }

  // Se não encontrar o time
  if (!teamData) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col relative">
        <header className="absolute top-4 left-4 z-30">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="OPIUM Logo" width="32" height="32" />
            <span className="text-lg font-semibold text-gray-800">OPSERVER</span>
          </Link>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Time não encontrado</h1>
            <Link href="/teams" className="text-gray-600 hover:text-gray-800 transition-colors">
              ← Voltar para Teams
            </Link>
          </div>
        </div>
        
        <footer className="fixed bottom-0 left-0 right-0 text-center py-2">
          <p className="text-xs text-gray-400">Development</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative">
      {/* Header - Logo Principal */}
      <div className="absolute top-4 left-4 z-30">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="OPIUM Logo" width="24" height="24" />
          <span className="text-sm font-semibold text-gray-800">OPSERVER</span>
        </Link>
      </div>

      {/* Team Logo - Centro */}
      <header className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 text-center">
        <Link href="/teams">
          {teamData.logo ? (
            <img 
              src={teamData.logo} 
              alt={`${teamData.name} Logo`}
              className="mx-auto object-contain" 
              width="40" 
              height="40" 
            />
          ) : (
            <div className="w-10 h-10 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-gray-400">{teamData.name.charAt(0)}</span>
            </div>
          )}
        </Link>
        <div className="mt-1">
          <ReactCountryFlag countryCode={teamData.country} svg style={{width: '0.8em', height: '0.8em'}} />
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="flex flex-wrap justify-center gap-8">
            {players.map((player) => (
              <Link 
                key={player.steamid64} 
                href={`/player/${player.id}`}
                target="_blank"
                rel="noopener noreferrer"
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
                    <div className="flex items-center justify-center gap-2 mb-1">
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
              <p className="text-gray-500">Nenhum jogador encontrado neste time.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Rodapé */}
      <footer className="fixed bottom-0 left-0 right-0 text-center py-2">
        <p className="text-xs text-gray-400">{teamData.name.toUpperCase()}</p>
      </footer>
    </div>
  )
}
