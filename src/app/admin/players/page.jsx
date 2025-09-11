'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { MEMBERSHIP_OPTIONS, ROLE_OPTIONS } from '../../../utils/configSchemas';
import { getMembershipType } from '../../../utils/membershipTypes';
import SimpleSteamAvatar from '../../../components/SimpleSteamAvatar';
import { CountryName } from '../../../components/CountryFlag';

export default function AdminPlayers() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    team: '',
    membership: '',
    benched: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      setError(null);
      
      // Testando mesma abordagem da ProSettings
      const response = await fetch('/api/players', {cache: 'no-store'});
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPlayers(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar players:', error);
      setError(error.message || 'Erro ao carregar players');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      setTeams(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar teams:', error);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 12l5 5 5-5H5zm0-4l5-5 5 5H5z"/>
        </svg>
      );
    }
    
    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      );
    }
  };

  const sortedAndFilteredPlayers = React.useMemo(() => {
    // Primeiro aplicar filtros
    let filtered = players.filter(player => {
      if (filters.search && !player.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.team && player.teamid !== filters.team) {
        return false;
      }
      if (filters.membership && player.idmembership.toString() !== filters.membership) {
        return false;
      }
      if (filters.benched === 'true' && !player.benched) {
        return false;
      }
      if (filters.benched === 'false' && player.benched) {
        return false;
      }
      return true;
    });

    // Depois aplicar ordenação
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'team':
          aValue = teams.find(team => team.id === a.teamid)?.name?.toLowerCase() || '';
          bValue = teams.find(team => team.id === b.teamid)?.name?.toLowerCase() || '';
          break;
        case 'role':
          aValue = a.idrole;
          bValue = b.idrole;
          break;
        case 'membership':
          aValue = a.idmembership;
          bValue = b.idmembership;
          break;
        case 'status':
          aValue = a.benched ? 1 : 0;
          bValue = b.benched ? 1 : 0;
          break;
        case 'country':
          aValue = a.country.toLowerCase();
          bValue = b.country.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [players, teams, filters, sortConfig]);

  const handleEditPlayer = (player) => {
    setSelectedPlayer(player);
    setError(null);
    setShowEditModal(true);
  };

  const handleAddPlayer = () => {
    setSelectedPlayer(null);
    setError(null);
    setShowEditModal(true);
  };

  const handleSavePlayer = async (updatedPlayer) => {
    setSaving(true);
    try {
      const method = selectedPlayer ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/players', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlayer)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      await fetchPlayers(); // Recarregar lista
      setShowEditModal(false);
      setSelectedPlayer(null);
      setError(null);
    } catch (error) {
      console.error('Erro ao salvar player:', error);
      setError(error.message || 'Erro ao salvar player');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlayer = async (steamId) => {
    if (!confirm('Tem certeza que deseja remover este player?')) return;

    try {
      setError(null);
      const response = await fetch('/api/admin/players', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamid64: steamId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      await fetchPlayers();
    } catch (error) {
      console.error('Erro ao deletar player:', error);
      setError(error.message || 'Erro ao deletar player');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Players</h1>
            <p className="text-gray-600">
              {loading ? 'Carregando...' : `${sortedAndFilteredPlayers.length} de ${players.length} players`}
            </p>
          </div>
          <button 
            onClick={handleAddPlayer}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Adicionar Player
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filtros</h3>
            <div className="text-sm text-gray-600">
              Ordenado por: <span className="font-medium">{
                sortConfig.key === 'name' ? 'Nome' :
                sortConfig.key === 'team' ? 'Time' :
                sortConfig.key === 'role' ? 'Role' :
                sortConfig.key === 'membership' ? 'Membership' :
                sortConfig.key === 'status' ? 'Status' : 'Nome'
              }</span> ({sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nome do player..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <select
                value={filters.team}
                onChange={(e) => setFilters({...filters, team: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Todos os times</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Membership</label>
              <select
                value={filters.membership}
                onChange={(e) => setFilters({...filters, membership: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Todos</option>
                {MEMBERSHIP_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.benched}
                onChange={(e) => setFilters({...filters, benched: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="false">Ativo</option>
                <option value="true">Banco</option>
              </select>
            </div>
          </div>
        </div>

        {/* Players Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Player
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('team')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Time
                    {getSortIcon('team')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Role
                    {getSortIcon('role')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('membership')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Membership
                    {getSortIcon('membership')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    Status
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Carregando players...
                  </td>
                </tr>
              ) : sortedAndFilteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Nenhum player encontrado
                  </td>
                </tr>
              ) : (
                sortedAndFilteredPlayers.map((player) => {
                  const membershipType = getMembershipType(player.idmembership);
                  const roleOption = ROLE_OPTIONS.find(r => r.value === player.idrole);
                  
                  return (
                    <tr key={player.steamid64} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <SimpleSteamAvatar
                            src={player.avatar}
                            alt={player.name}
                            size="w-10 h-10"
                            fallbackInitial={player.name?.charAt(0)?.toUpperCase() || '?'}
                            className="mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{player.name}</div>
                            <CountryName countryCode={player.country} className="text-sm text-gray-500" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {teams.find(team => team.id === player.teamid)?.name || 'Sem time'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {roleOption?.label || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{ 
                            color: membershipType.color, 
                            backgroundColor: membershipType.bgColor 
                          }}
                        >
                          {membershipType.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          player.benched 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {player.benched ? 'Banco' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.steamid64)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <PlayerEditModal
            player={selectedPlayer}
            teams={teams}
            saving={saving}
            onSave={handleSavePlayer}
            onClose={() => {
              setShowEditModal(false);
              setSelectedPlayer(null);
              setError(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Modal Component
function PlayerEditModal({ player, teams, saving, onSave, onClose }) {
  const [formData, setFormData] = useState({
    steamProfileUrl: '', // novo campo para o link do perfil
    steamid64: player?.steamid64 || '',
    name: player?.name || '',
    country: player?.country || 'BR',
    birthday: player?.birthday || '',
    gamersclubid: player?.gamersclubid || '',
    teamid: player?.teamid || '',
    idrole: player?.idrole || 0,
    idmembership: player?.idmembership || 0,
    benched: player?.benched || false
  });

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);


  // Função para extrair vanity/nick do link Steam
  const extractVanityFromUrl = (url) => {
    if (!url) return '';
    try {
      // Ex: https://steamcommunity.com/id/algum_nick ou https://steamcommunity.com/profiles/steamid64
      const matchId = url.match(/steamcommunity\.com\/id\/([^\/]+)/);
      const matchProfile = url.match(/steamcommunity\.com\/profiles\/(\d+)/);
      if (matchId) return matchId[1];
      if (matchProfile) return matchProfile[1];
      return '';
    } catch {
      return '';
    }
  };


  // Função para resolver vanity para steamid64 via API interna
  const resolveSteamId = async (url) => {
    if (!url) return '';
    try {
      const res = await fetch('/api/steam/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.steamid64) return data.steamid64;
      return '';
    } catch {
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    let steamid64 = formData.steamid64;
    // Se o campo de link foi preenchido, resolve o steamid64
    if (formData.steamProfileUrl && !steamid64) {
      steamid64 = await resolveSteamId(formData.steamProfileUrl);
    }
    if (!steamid64) {
      alert('Não foi possível obter o SteamID64 do perfil informado.');
      return;
    }
    onSave({ ...formData, steamid64 });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {player ? 'Editar Player' : 'Adicionar Player'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link do perfil Steam</label>
            <input
              type="text"
              value={formData.steamProfileUrl}
              onChange={(e) => setFormData({ ...formData, steamProfileUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Cole o link do perfil Steam aqui"
              required={!player}
              disabled={!!player}
            />
            {/* Campo oculto para steamid64, preenchido automaticamente */}
            <input
              type="hidden"
              value={formData.steamid64}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              maxLength="10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value.toUpperCase().slice(0,2)})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              maxLength="3"
              placeholder="BR"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GamersClub ID</label>
            <input
              type="text"
              value={formData.gamersclubid}
              onChange={(e) => setFormData({...formData, gamersclubid: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="ID do GamersClub (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({...formData, birthday: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <select
              value={formData.teamid}
              onChange={(e) => setFormData({...formData, teamid: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Sem time</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.idrole}
              onChange={(e) => setFormData({...formData, idrole: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {ROLE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membership</label>
            <select
              value={formData.idmembership}
              onChange={(e) => setFormData({...formData, idmembership: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {MEMBERSHIP_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="benched"
              checked={formData.benched}
              onChange={(e) => setFormData({...formData, benched: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="benched" className="text-sm font-medium text-gray-700">
              Player no banco
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
