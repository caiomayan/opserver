import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";

export default async function PlayerPage({ params }) {
  const { id } = await params;
  
  // Buscar dados do jogador e do time
  let playerData = null;
  let teamData = null;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const [playersRes, teamsRes] = await Promise.all([
      fetch(`${baseUrl}/api/players`, {cache: 'no-store'}),
      fetch(`${baseUrl}/api/teams`, {cache: 'no-store'}).catch(() => null)
    ]);
    
    if (playersRes.ok) {
      const players = await playersRes.json();
      playerData = players.find(player => player.id === id);
      
      // Buscar dados do time se o jogador tiver teamId
      if (playerData?.teamId && teamsRes?.ok) {
        const teams = await teamsRes.json();
        teamData = teams.find(team => team.id === playerData.teamId);
      }
    }
  } catch (error) {
    console.log('Erro ao buscar dados:', error.message);
  }

  // Se não encontrar o jogador
  if (!playerData) {
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
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Jogador não encontrado</h1>
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

  // Calcular eDPI
  const edpi = (parseFloat(playerData.settings.sensitivity) * parseInt(playerData.settings.dpi)).toFixed(0);

  // Calcular idade baseada no aniversário
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    
    const [month, day, year] = birthday.split('-');
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const age = calculateAge(playerData.birthday);

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
        <Link href={teamData ? `/team/${teamData.id}` : "/teams"}>
          {teamData?.logo ? (
            <img 
              src={teamData.logo} 
              alt={`${teamData.name} Logo`}
              className="mx-auto object-contain" 
              width="40" 
              height="40" 
            />
          ) : (
            <img src="/logo.svg" alt="Logo" className="mx-auto" width="40" height="40" />
          )}
        </Link>
        {teamData && (
          <div className="mt-1">
            <ReactCountryFlag countryCode={teamData.country} svg style={{width: '0.8em', height: '0.8em'}} />
          </div>
        )}
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Avatar e informações principais */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden shadow-lg mx-auto mb-4">
              {playerData.avatar ? (
                <img 
                  src={playerData.avatar} 
                  alt={`Avatar de ${playerData.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-3xl font-bold">{playerData.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold text-gray-800">{playerData.name}</h1>
              <ReactCountryFlag countryCode={playerData.country} svg style={{width: '1.5em', height: '1.5em'}} />
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <a 
                href={`https://steamcommunity.com/profiles/${playerData.steamid64}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <img src="/platforms/steam.svg" alt="Steam" className="w-4 h-4" />
              </a>
              
              {playerData.level && playerData.level !== 'Indisponível' && playerData.level !== '?' && typeof playerData.level === 'number' && (
                <a 
                  href={`https://gamersclub.com.br/player/${playerData.gamersclubid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <img src="/platforms/gamersclub.svg" alt="GamersClub" className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Informações do jogador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Configurações de Mouse */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Mouse</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sensibilidade</span>
                  <span className="font-medium text-gray-800">{playerData.settings.sensitivity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DPI</span>
                  <span className="font-medium text-gray-800">{playerData.settings.dpi}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">eDPI</span>
                  <span className="font-semibold text-gray-800">{edpi}</span>
                </div>
              </div>
            </div>

            {/* Informações Pessoais */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Informações</h2>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">País</span>
                  <div className="flex items-center gap-2">
                    <ReactCountryFlag countryCode={playerData.country} svg style={{width: '1em', height: '1em'}} />
                    <span className="font-medium text-gray-800">{playerData.country}</span>
                  </div>
                </div>
                {age && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Idade</span>
                    <span className="font-medium text-gray-800">{age} anos</span>
                  </div>
                )}
                {playerData.level && playerData.level !== 'Indisponível' && playerData.level !== '?' && typeof playerData.level === 'number' && (
                  <>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level GC</span>
                      <span className="font-semibold text-gray-800">{playerData.level}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rodapé */}
      <footer className="fixed bottom-0 left-0 right-0 text-center py-2">
        <p className="text-xs text-gray-400">{teamData ? teamData.name.toUpperCase() : 'Development'}</p>
      </footer>
    </div>
  );
}
