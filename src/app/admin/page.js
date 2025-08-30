"use client";
function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '';
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  if (
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }
  return idade;
}

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { usePlayers, useTeams } from '../../hooks/useData';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('players');
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { players, loading: playersLoading } = usePlayers();
  const { teams, loading: teamsLoading } = useTeams();
  const [playerForm, setPlayerForm] = useState({
    name: '',
    country: '',
    birthday: '',
    steamid64: '',
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

  if (authLoading) {
    return (
      <Layout footerText="Development">
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    // Adicionar jogador no Supabase
  const { name, country, birthday, steamid64, teamId, sensitivity, dpi } = playerForm;
    const settings = {
      sensitivity: Number(sensitivity),
      dpi: Number(dpi)
    };
    const { error } = await supabase.from('players').insert([
      {
        name,
        country,
        birthday,
        steamid64,
  // ...existing code...
        teamId,
        idrole: 0, // ou selecione via form se quiser
        settings
      }
    ]);
    if (error) {
      alert('Erro ao adicionar jogador: ' + error.message);
    } else {
      alert('Jogador adicionado com sucesso!');
    }
    setPlayerForm({
      name: '',
      country: '',
      birthday: '',
      steamid64: '',
      teamId: '0',
      sensitivity: '',
      dpi: ''
    });
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    // Adicionar time no Supabase
    const { id, name, country, logo } = teamForm;
    const { error } = await supabase.from('teams').insert([
      { id, name, country, logo }
    ]);
    if (error) {
      alert('Erro ao adicionar time: ' + error.message);
    } else {
      alert('Time adicionado com sucesso!');
    }
    setTeamForm({
      id: '',
      name: '',
      country: '',
      logo: ''
    });
  };

  if (playersLoading || teamsLoading) {
    return (
      <Layout footerText="Development">
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </Layout>
    );
  }

  const headerProps = {
    logoSize: 24
  };

  return (
    <Layout 
      headerProps={headerProps}
      footerText="Development"
      fullPage={true}
    >
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 pt-16">
          <h1 className="text-3xl font-semibold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600">Manage players and teams</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('players')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'players'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Players ({players?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'teams'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Teams ({teams?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Player Form */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select
                    value={playerForm.teamId}
                    onChange={(e) => setPlayerForm({...playerForm, teamId: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    {teams?.map(team => (
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
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Players</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {players?.map((player) => (
                  <div key={player.steamid64} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{player.name}</p>
                        <p className="text-sm text-gray-600">
                          {player.country} • {player.settings?.sensitivity}/{player.settings?.dpi}
                          {player.birthday && (
                            <> • Idade: {calcularIdade(player.birthday)}</>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Team: {teams?.find(t => t.id === player.teamId)?.name || 'Unknown'}</p>
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
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Teams</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {teams?.map((team) => (
                  <div key={team.id} className="bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{team.name}</p>
                        <p className="text-sm text-gray-600">{team.country} • ID: {team.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Players: {players?.filter(p => p.teamId === team.id).length || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
