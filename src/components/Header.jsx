'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SteamAuth from './SteamAuth';

const Header = () => {
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await fetch('/api/auth/user', { 
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          
          // Verificar se usuário existe no banco para obter membership
          if (userData?.id) {
            const checkRes = await fetch('/api/auth/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                steamid64: userData.id
              })
            });
            
            if (checkRes.ok) {
              const membershipData = await checkRes.json();
              if (membershipData.exists) {
                setUserMembership(membershipData.data?.idmembership);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Verificar se usuário é admin (2) ou dono (3)
  const isAdminOrOwner = userMembership === 2 || userMembership === 3;

  return (
    <nav className="w-full h-16 flex items-center justify-between px-6">
      {/* Logo e menu */}
      <div className="flex items-center gap-8">
        <Link href="/">
          <img src="/logo.svg" alt="Logo" className="h-10 w-10 object-contain" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Início</Link>
          <Link href="/teams" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Times</Link>
          <Link href="#" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Jogar</Link>
          <Link href="https://inventory.cstrike.app/" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Inventário</Link>
          <Link href="#" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">Ranking</Link>
          <Link href="/prosettings" className="text-gray-800 font-semibold hover:text-blue-600 transition-colors">ProSettings</Link>
          {/* Link Admin - só aparece para Admin (2) ou Dono (3) */}
          {!loading && isAdminOrOwner && (
            <Link href="/admin" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
              Admin
            </Link>
          )}
        </div>
      </div>
      {/* Login/Avatar */}
      <SteamAuth />
    </nav>
  );
};

export default Header;
