
'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';

const Dashboard = () => {

  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  // Verifica se é admin (exemplo: role no metadata)
  const isAdmin = user?.user_metadata?.role === 'admin';

  // Avatar do usuário
  // Avatar e username: prioriza metadata, depois email, depois fallback
  const avatarUrl = user?.user_metadata?.avatar
    || user?.avatar_url
    || '/logo.svg';

  const username = user?.user_metadata?.username
    || (user?.email ? user.email.split('@')[0] : 'Usuário');

  const [showAdminTooltip, setShowAdminTooltip] = useState(false);
  const menuItems = [
    {
      title: 'Times',
      description: 'Times registrados',
      href: '/teams'
    }
  ];

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        {/* Avatar grande centralizado */}
        <div className="w-32 h-32 overflow-hidden mx-auto mb-4 flex items-center justify-center">
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl text-gray-900 mb-2 tracking-tight text-center">Bem-vindo ao <span className="font-bold">OPSERVER</span></h1>
        <span className="text-gray-700 text-lg mb-4 text-center">Olá, <span className="font-semibold">{username}</span></span>
        {/* Botão de configurações abaixo do nome */}
        <div className="relative mb-8">
            <button
              className="px-5 py-2 bg-white border cursor-pointer border-gray-200 rounded-lg shadow hover:bg-gray-50 text-gray-700 font-medium"
              onClick={handleSignOut}
              aria-label="Logout"
            >
              Logout
            </button>
        </div>

        {/* Cards de menu centralizados, igual jogadores/times */}
        <div className="flex flex-wrap justify-center gap-12 mt-2">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} className="group relative">
              <div className="w-25 h-12.5 border border-gray-200 rounded-lg hover:bg-gray-100 shadow-lg flex flex-col items-center justify-center cursor-pointer">
                <span className="font-semibold text-base text-gray-900 text-center">{item.title}</span>
              </div>
            </Link>
          ))}
          {/* Botão Admin */}
          <div
            className="group relative w-25 h-12.5 border border-gray-200 rounded-lg shadow-lg flex flex-col items-center justify-center cursor-not-allowed bg-gray-50 text-gray-400 ml-2"
            onMouseEnter={() => setShowAdminTooltip(true)}
            onMouseLeave={() => setShowAdminTooltip(false)}
            onClick={() => setShowAdminTooltip(true)}
            tabIndex={0}
            aria-label="Admin (em breve!)"
          >
            <span className="font-semibold text-base text-gray-400 text-center">Admin</span>
            {showAdminTooltip && (
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 text-xs bg-gray-800 text-white rounded shadow z-10 whitespace-nowrap">em breve!</span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
