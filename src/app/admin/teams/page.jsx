'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null); // ID do time sendo deletado
  const [filters, setFilters] = useState({
    search: '',
    country: ''
  });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [teamStats, setTeamStats] = useState({});

  useEffect(() => {
    fetchTeams();
    fetchTeamStats();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/admin/teams');
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          alert('Sessão expirada. Faça login novamente.');
          window.location.href = '/';
          return;
        }
        throw new Error(data.error || 'Erro ao carregar teams');
      }
      
      setTeams(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar teams:', error);
      alert('Erro ao carregar teams: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async () => {
    try {
      const response = await fetch('/api/admin/teams/stats');
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          // Não redirecionar aqui, pois fetchTeams já vai redirecionar
          console.warn('Falha na autenticação para estatísticas');
          return;
        }
        throw new Error(data.error || 'Erro ao carregar estatísticas');
      }
      
      setTeamStats(data.data || {});
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const filteredTeams = teams.filter(team => {
    if (filters.search && !team.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !team.id.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.country && team.countryid !== filters.country) {
      return false;
    }
    return true;
  });

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setShowEditModal(true);
  };

  const handleSaveTeam = async (updatedTeam) => {
    setSaving(true);
    try {
      const method = selectedTeam ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/teams', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeam)
      });

      const result = await response.json();

      if (response.ok) {
        alert(selectedTeam ? 'Time atualizado com sucesso!' : 'Time criado com sucesso!');
        await fetchTeams();
        await fetchTeamStats();
        setShowEditModal(false);
        setSelectedTeam(null);
      } else {
        if (response.status === 403) {
          alert('Sessão expirada. Faça login novamente.');
          window.location.href = '/';
          return;
        }
        alert('Erro ao salvar time: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao salvar team:', error);
      alert('Erro de conexão ao salvar time: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Tem certeza que deseja remover este time? Isso também removerá todos os players associados.')) return;

    setDeleting(teamId);
    try {
      const response = await fetch(`/api/admin/teams?id=${encodeURIComponent(teamId)}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Time removido com sucesso!');
        await fetchTeams();
        await fetchTeamStats();
      } else {
        if (response.status === 403) {
          alert('Sessão expirada. Faça login novamente.');
          window.location.href = '/';
          return;
        }
        alert('Erro ao remover time: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao deletar team:', error);
      alert('Erro de conexão ao deletar time: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const getPlayerCount = (teamId) => {
    return teamStats.teamPlayerCounts?.[teamId] || 0;
  };

  const uniqueCountries = [...new Set(teams.map(team => team.countryid).filter(Boolean))];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Times</h1>
            <p className="text-gray-600">
              {loading ? 'Carregando...' : `${filteredTeams.length} de ${teams.length} times`}
              {(filters.search || filters.country) && (
                <span className="text-blue-600 ml-2">
                  (filtrado)
                  <button 
                    onClick={() => setFilters({ search: '', country: '' })}
                    className="ml-1 text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    limpar filtros
                  </button>
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={() => {
              setSelectedTeam(null);
              setShowEditModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            ➕ Criar Time
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total de Times</div>
            <div className="text-2xl font-bold text-gray-900">{teams.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Times com Players</div>
            <div className="text-2xl font-bold text-green-600">{teamStats.withPlayers || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Times Vazios</div>
            <div className="text-2xl font-bold text-yellow-600">{teamStats.emptyTeams || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Média Players/Time</div>
            <div className="text-2xl font-bold text-blue-600">{teamStats.averagePlayersPerTeam || '0'}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nome ou ID do time..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({...filters, country: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Todos os países</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Carregando times...
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Nenhum time encontrado
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div key={team.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Team Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      {team.logo ? (
                        <img 
                          src={team.logo} 
                          alt={team.name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-xl font-bold text-gray-400 w-full h-full flex items-center justify-center"
                        style={{ display: team.logo ? 'none' : 'flex' }}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{team.name}</h3>
                      <p className="text-sm text-gray-500 truncate">ID: {team.id}</p>
                    </div>
                    {team.countryid && (
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {team.countryid}
                      </span>
                    )}
                  </div>

                  {/* Team Stats */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Players:</span>
                      <span className={`font-medium ${
                        getPlayerCount(team.id) > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {getPlayerCount(team.id)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      disabled={deleting === team.id}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        deleting === team.id 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {deleting === team.id ? 'Removendo...' : 'Remover'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <TeamEditModal
            team={selectedTeam}
            onSave={handleSaveTeam}
            onClose={() => {
              if (!saving) {
                setShowEditModal(false);
                setSelectedTeam(null);
              }
            }}
            saving={saving}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Modal Component
function TeamEditModal({ team, onSave, onClose, saving }) {
  const [formData, setFormData] = useState({
    id: team?.id || '',
    name: team?.name || '',
    countryid: team?.countryid || '',
    logo: team?.logo || ''
  });

  const [errors, setErrors] = useState({});

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'ID é obrigatório';
    } else if (formData.id.length >= 10) {
      newErrors.id = 'ID deve ter menos de 10 caracteres';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length >= 20) {
      newErrors.name = 'Nome deve ter menos de 20 caracteres';
    }

    // Validar URL do logo se fornecida
    if (formData.logo && formData.logo.trim()) {
      const logoValue = formData.logo.trim();
      
      // Aceitar caminhos relativos (começando com /) ou URLs completas
      if (logoValue.startsWith('/')) {
        // Caminho relativo - verificar se termina com extensão de imagem
        if (!logoValue.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i)) {
          newErrors.logo = 'Caminho deve apontar para uma imagem (jpg, png, svg, etc.)';
        }
      } else {
        // URL completa - validar formato
        try {
          new URL(logoValue);
          if (!logoValue.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i)) {
            newErrors.logo = 'URL deve apontar para uma imagem (jpg, png, svg, etc.)';
          }
        } catch {
          newErrors.logo = 'URL inválida ou use caminho relativo (ex: /teams/logo.svg)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 id="modal-title" className="text-lg font-semibold mb-4">
          {team ? 'Editar Time' : 'Criar Time'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do Time *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value.toLowerCase()})}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.id ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="ex: furia, navi, spirit"
              disabled={!!team} // Não permitir editar ID existente
              required
            />
            {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Time *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="ex: FURIA, NAVI, Team Spirit"
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País (código)
            </label>
            <input
              type="text"
              value={formData.countryid}
              onChange={(e) => setFormData({...formData, countryid: e.target.value.toUpperCase()})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="BR, US, RU, etc."
              maxLength="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL do Logo
            </label>
            <input
              type="text"
              value={formData.logo}
              onChange={(e) => setFormData({...formData, logo: e.target.value})}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.logo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="/teams/logo.svg ou https://example.com/logo.png"
            />
            {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 rounded-lg ${
                saving 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-white ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving 
                ? (team ? 'Atualizando...' : 'Criando...') 
                : (team ? 'Atualizar' : 'Criar')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
