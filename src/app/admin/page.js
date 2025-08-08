'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    gamersclub: '',
    steamid64: '',
    config: { sensibilidade: '', dpi: '' }
  });

  // Template simplificado
  const getEmptyFormData = () => ({
    nome: '',
    gamersclub: '',
    steamid64: '',
    config: { sensibilidade: '', dpi: '' }
  });

  // Converter valores null mantendo apenas campos do template
  const convertNullToString = (obj, template) => {
    const result = { ...template };
    for (const key of Object.keys(template)) {
      const val = obj?.[key];
      if (val === null || val === undefined) {
        if (typeof template[key] === 'object' && template[key] !== null) {
          result[key] = convertNullToString({}, template[key]);
        } else {
          result[key] = '';
        }
      } else if (typeof val === 'object' && val !== null && typeof template[key] === 'object') {
        result[key] = convertNullToString(val, template[key]);
      } else {
        result[key] = val;
      }
    }
    return result;
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
      }
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: editingPlayer ? 'update' : 'create',
          player: formData,
          originalName: editingPlayer
        }),
      });

      if (response.ok) {
        await fetchPlayers();
        setShowForm(false);
        setEditingPlayer(null);
        setFormData(getEmptyFormData());
      } else {
        alert('Erro ao salvar jogador');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar jogador');
    }
  };

  const editPlayer = (player) => {
    setEditingPlayer(player.nome);
    const template = getEmptyFormData();
    const convertedPlayer = convertNullToString(player, template);
    setFormData(convertedPlayer);
    setShowForm(true);
  };

  const deletePlayer = async (nome) => {
    if (confirm(`Tem certeza que deseja deletar ${nome}?`)) {
      try {
        const response = await fetch('/api/admin', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nome }),
        });

        if (response.ok) {
          await fetchPlayers();
        } else {
          alert('Erro ao deletar jogador');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar jogador');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-xl text-white">⚡ Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">⚙️ Admin Panel</h1>
            <p className="text-gray-400">Gerencie jogadores e configurações</p>
          </div>
          <Link 
            href="/"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            ← Voltar ao Início
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">🎮 Jogadores Cadastrados</h2>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
            >
              + Adicionar Jogador
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Nome</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">GamersClub</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Steam ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={index} className="border-t border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{player.nome}</td>
                    <td className="py-4 px-6 text-gray-300">{player.gamersclub}</td>
                    <td className="py-4 px-6 text-gray-300 font-mono text-sm">{player.steamid64}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => editPlayer(player)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors shadow-md"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => deletePlayer(player.nome)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors shadow-md"
                        >
                          🗑️ Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">
                    {editingPlayer ? '✏️ Editar Jogador' : '➕ Adicionar Jogador'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingPlayer(null);
                    }}
                    className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      👤 Informações Básicas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                        <input
                          type="text"
                          value={formData.nome || ''}
                          onChange={(e) => handleInputChange(null, 'nome', e.target.value)}
                          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                          placeholder="Nome do jogador"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">GamersClub</label>
                        <input
                          type="text"
                          value={formData.gamersclub || ''}
                          onChange={(e) => handleInputChange(null, 'gamersclub', e.target.value)}
                          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                          placeholder="Username GamersClub"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Steam ID64</label>
                        <input
                          type="text"
                          value={formData.steamid64 || ''}
                          onChange={(e) => handleInputChange(null, 'steamid64', e.target.value)}
                          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
                          required
                          placeholder="Steam ID64"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configurações */}
                  <div className="space-y-4 border-t border-gray-700 pt-6">
                    <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      🎯 Configurações
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sensibilidade</label>
                        <input
                          type="text"
                          value={formData.config.sensibilidade || ''}
                          onChange={(e) => handleInputChange('config', 'sensibilidade', e.target.value)}
                          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">DPI</label>
                        <input
                          type="text"
                          value={formData.config.dpi || ''}
                          onChange={(e) => handleInputChange('config', 'dpi', e.target.value)}
                          className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingPlayer(null); }}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-colors shadow-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105"
                    >
                      {editingPlayer ? 'Atualizar' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
