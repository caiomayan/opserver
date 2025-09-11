'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    activePlayers: 0,
    benchedPlayers: 0,
    adminPlayers: 0,
    premiumPlayers: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        fetch('/api/admin/players/stats'),
        fetch('/api/admin/teams/stats')
      ]);

      const playersData = playersRes.ok ? await playersRes.json() : { data: {} };
      const teamsData = teamsRes.ok ? await teamsRes.json() : { data: {} };

      setStats({
        totalPlayers: playersData.data?.total || 0,
        totalTeams: teamsData.data?.total || 0,
        activePlayers: playersData.data?.active || 0,
        benchedPlayers: playersData.data?.benched || 0,
        adminPlayers: playersData.data?.admins || 0,
        premiumPlayers: playersData.data?.premium || 0,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.loading ? '...' : value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Players"
            value={stats.totalPlayers}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Total de Times"
            value={stats.totalTeams}
            icon="🏆"
            color="green"
          />
          <StatCard
            title="Players Ativos"
            value={stats.activePlayers}
            icon="✅"
            color="emerald"
          />
          <StatCard
            title="Players Bancos"
            value={stats.benchedPlayers}
            icon="📋"
            color="yellow"
          />
        </div>

        {/* Membership Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Membership</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-purple-600 mr-3">👑</span>
                <span className="font-medium text-gray-900">Admins</span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {stats.loading ? '...' : stats.adminPlayers}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-orange-600 mr-3">⭐</span>
                <span className="font-medium text-gray-900">Premium</span>
              </div>
              <span className="text-xl font-bold text-orange-600">
                {stats.loading ? '...' : stats.premiumPlayers}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/players?action=add"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-blue-600 mr-3 text-xl">➕</span>
              <span className="font-medium text-blue-900">Adicionar Player</span>
            </a>
            <a
              href="/admin/teams?action=add"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="text-green-600 mr-3 text-xl">🏆</span>
              <span className="font-medium text-green-900">Criar Time</span>
            </a>
            <a
              href="/admin/players?filter=pending"
              className="flex items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <span className="text-yellow-600 mr-3 text-xl">⏳</span>
              <span className="font-medium text-yellow-900">Players Pendentes</span>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 mr-3">📝</span>
              <span className="text-sm text-gray-700">
                Sistema administrativo inicializado
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date().toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
