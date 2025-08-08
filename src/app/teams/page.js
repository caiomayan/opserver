import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";

export default async function TeamsPage() {
  let teams = [];

  try {
    const res = await fetch('http://localhost:3000/api/teams', {cache: 'no-store'});
    teams = res.ok ? await res.json() : [];
  } catch (error) {
    console.log('Erro ao buscar dados dos times:', error.message);
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative">
      {/* Header */}
      <header className="absolute top-4 left-4 z-30">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="OPIUM Logo" width="24" height="24" />
          <span className="text-sm font-semibold text-gray-800">OPSERVER</span>
        </Link>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">Teams</h1>
            <p className="text-gray-600">Professional CS2 Teams</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {teams.map((team) => (
              <Link 
                key={team.id} 
                href={`/team/${team.id}`}
                className="group relative block cursor-pointer"
              >
                <div className="bg-gray-50 hover:bg-gray-100 p-8 rounded-lg transition-colors border border-gray-200 hover:border-gray-300 min-w-64">
                  <div className="text-center">
                    {team.logo ? (
                      <img 
                        src={team.logo} 
                        alt={`${team.name} Logo`}
                        className="w-16 h-16 mx-auto mb-4 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400">{team.name.charAt(0)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-800">{team.name}</h2>
                      <ReactCountryFlag countryCode={team.country} svg style={{width: '1.2em', height: '1.2em'}} />
                    </div>
                    
                    <p className="text-sm text-gray-600">Professional Team</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {teams.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando times...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Rodapé */}
      <footer className="fixed bottom-0 left-0 right-0 text-center py-2">
        <p className="text-xs text-gray-400">Development</p>
      </footer>
    </div>
  )
}
