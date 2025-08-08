'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('players');
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [playerForm, setPlayerForm] = useState({
    name: '',
    country: '',
    birthday: '',
    steamid64: '',
    gamersclubid: '',
    teamId: '0',
    sensitivity: '',
    dpi: ''
  });

  const [teamForm, setTeamForm] = useState({
    id: '',
    name: '',
    country: '',
    logo: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams')
      ]);
      
      if (playersRes.ok) setPlayers(await playersRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
    setLoading(false);
  };

  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    // Simular adição (em produção seria uma API POST)
    console.log('Novo jogador:', playerForm);
    
    // Reset form
    setPlayerForm({
      name: '',
      country: '',
      birthday: '',
      steamid64: '',
      gamersclubid: '',
      teamId: '0',
      sensitivity: '',
      dpi: ''
    });
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    // Simular adição (em produção seria uma API POST)
    console.log('Novo time:', teamForm);
    
    // Reset form
    setTeamForm({
      id: '',
      name: '',
      country: '',
      logo: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="absolute top-4 left-4 z-30">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="OPIUM Logo" width="24" height="24" />
              <span className="text-sm font-semibold text-gray-800">OPSERVER</span>
            </Link>
          </div>
          <div className="pt-16">
            <h1 className="text-3xl font-semibold text-gray-800">Admin Panel</h1>
            <p className="text-gray-600">Manage players and teams</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('players')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'players'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Players ({players.length})
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'teams'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Teams ({teams.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Player Form */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Player</h2>
              <form onSubmit={handlePlayerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({...playerForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={playerForm.country}
                      onChange={(e) => setPlayerForm({...playerForm, country: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="BR"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                    <input
                      type="text"
                      value={playerForm.birthday}
                      onChange={(e) => setPlayerForm({...playerForm, birthday: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="MM-DD-YYYY"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Steam ID64</label>
                  <input
                    type="text"
                    value={playerForm.steamid64}
                    onChange={(e) => setPlayerForm({...playerForm, steamid64: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GamersClub ID</label>
                  <input
                    type="text"
                    value={playerForm.gamersclubid}
                    onChange={(e) => setPlayerForm({...playerForm, gamersclubid: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select
                    value={playerForm.teamId}
                    onChange={(e) => setPlayerForm({...playerForm, teamId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sensitivity</label>
                    <input
                      type="text"
                      value={playerForm.sensitivity}
                      onChange={(e) => setPlayerForm({...playerForm, sensitivity: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DPI</label>
                    <input
                      type="text"
                      value={playerForm.dpi}
                      onChange={(e) => setPlayerForm({...playerForm, dpi: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Add Player
                </button>
              </form>
            </div>

            {/* Players List */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Players</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {players.map((player) => (
                  <div key={player.steamid64} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{player.name}</p>
                        <p className="text-sm text-gray-600">{player.country} • {player.settings?.sensitivity}/{player.settings?.dpi}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Team: {teams.find(t => t.id === player.teamId)?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Team Form */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Team</h2>
              <form onSubmit={handleTeamSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team ID</label>
                  <input
                    type="text"
                    value={teamForm.id}
                    onChange={(e) => setTeamForm({...teamForm, id: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={teamForm.country}
                    onChange={(e) => setTeamForm({...teamForm, country: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="BR"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo Path</label>
                  <input
                    type="text"
                    value={teamForm.logo}
                    onChange={(e) => setTeamForm({...teamForm, logo: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="/teams/team-logo.svg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Add Team
                </button>
              </form>
            </div>

            {/* Teams List */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Teams</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {teams.map((team) => (
                  <div key={team.id} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{team.name}</p>
                        <p className="text-sm text-gray-600">{team.country} • ID: {team.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Players: {players.filter(p => p.teamId === team.id).length}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
