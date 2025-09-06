
'use client';

import { useEffect, useState } from 'react';
import { getMembershipName, getMembershipColor, getMembershipBgColor } from '../utils/membershipTypes';

const SteamAuth = () => {
  const [user, setUser] = useState(null);
  const [showBox, setShowBox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [membershipData, setMembershipData] = useState(null);

  // Function to check if user exists and get data
  const checkUserExists = async (steamUser) => {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steamid64: steamUser.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
    return { exists: false };
  };

  // Function to register new user in Supabase
  const registerUserInSupabase = async (steamUser) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steamid64: steamUser.id,
          name: steamUser.displayName || steamUser.personaname || steamUser.name
        })
      });

      if (response.ok) {
        const userData = await response.json();
        setMembershipData(userData.data);
        return userData.data;
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchUserAndRegister = async () => {
      try {
        // Usar sempre a API local (que vai decidir entre Express ou JWT)
        const res = await fetch('/api/auth/user', { 
          credentials: 'include',
          cache: 'no-store'
        });
        const userData = await res.json();
        
        if (userData && userData.id) {
          setUser(userData);
          
          // Check if user already exists in our database
          const userCheck = await checkUserExists(userData);
          
          if (userCheck.exists) {
            // User exists, just load their data
            console.log('User already exists, loading data...');
            setMembershipData(userCheck.data);
          } else {
            // New user, register them
            console.log('New user detected, registering...');
            await registerUserInSupabase(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRegister();
  }, []);

  const handleLogout = async () => {
    console.log('Logout button clicked'); // Debug log
    
    try {
      // Usar sempre a API local (que vai decidir entre Express ou JWT)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('Logout successful');
        // Clear local state after successful logout
        setUser(null);
        setMembershipData(null);
        setShowBox(false);
        
        // Optional: Show success message or just stay on current page
        // No redirect needed - user stays where they are
      } else {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if request fails, clear local state
      setUser(null);
      setMembershipData(null);
      setShowBox(false);
    }
  };

  // Steam avatar pode estar em user.avatar.medium ou user.photos[0].value
  const avatarUrl = user?.avatar?.medium || user?.photos?.[0]?.value;
  
  // Prioriza o nome do banco de dados sobre o nome da Steam
  const displayName = membershipData?.name || user?.displayName || user?.personaname || user?.name;
  
  // Get membership info
  const membershipLevel = membershipData?.idmembership ?? 0;
  const membershipName = getMembershipName(membershipLevel);
  const membershipColor = getMembershipColor(membershipLevel);
  const membershipBgColor = getMembershipBgColor(membershipLevel);

  if (loading) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 relative">
      {!user ? (
        <button
          onClick={() => {
            // Usar sempre a API do Next.js para autenticação Steam
            window.location.href = '/api/auth/steam';
          }}
          className="bg-[#1b2836] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#171a21] transition-colors"
        >
          <img src="/platforms/steam.svg" alt="Steam" className="w-5 h-5" />
          Conectar via Steam
        </button>
      ) : (
        <>
          <button
            onClick={() => setShowBox((v) => !v)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full border border-gray-300" />
          </button>
          {showBox && (
            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[220px] z-50">
              <div className="flex items-center gap-3 mb-3">
                <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-300" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 truncate">{displayName}</div>
                  <div 
                    className="text-xs font-bold px-2 py-1 rounded-full inline-block mt-1"
                    style={{ 
                      color: membershipColor, 
                      backgroundColor: membershipBgColor 
                    }}
                  >
                    {membershipName.toUpperCase()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
              >
                Sair
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SteamAuth;
