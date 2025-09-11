'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import AdminProtection from './AdminProtection';
import Footer from './Footer';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Players', href: '/admin/players', icon: '👥' },
    { name: 'Teams', href: '/admin/teams', icon: '🏆' },
    { name: 'Configs', href: '/admin/configs', icon: '⚙️' },
  ];

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col z-10">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Painel de Administração</p>
          </div>
          
          <nav className="mt-6 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 mt-auto">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-xs text-gray-600">Logado como:</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.personaname || 'Admin'}
              </p>
              <div className="flex items-center justify-between mt-2">
                <Link 
                  href="/"
                  className="text-xs text-blue-600 hover:text-blue-700 inline-block"
                >
                  ← Voltar ao site
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => item.href === pathname)?.name || 'Admin'}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                  {user?.avatar?.medium && (
                    <img
                      src={user.avatar.medium}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        
        {/* Footer Global */}
        <Footer text="ADMIN PANEL" />
      </div>
    </AdminProtection>
  );
}
