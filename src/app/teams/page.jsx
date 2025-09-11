'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CountryFlag from '../../components/CountryFlag';
import LogoHeader from '../../components/LogoHeader';
import Layout from '../../components/Layout';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        // Usar URL relativa para funcionar tanto em localhost quanto em produção
        const res = await fetch('/api/teams', {cache: 'no-store'});
        
        if (res.ok) {
          const data = await res.json();
          setTeams(data.data || []);
        } else {
          throw new Error('Erro ao carregar times');
        }
      } catch (error) {
        setError(error.message);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <LoadingScreen loadingDuration={2200}>
        <Layout />
      </LoadingScreen>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          {/* Grid de logos dos times */}
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
            {Array.isArray(teams) && teams.map((team) => (
              <div key={team.id} className="group relative">
                <Link href={`/team/${team.id}`}>
                  <div className="w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">
                    <img 
                      src={team.logo || "/teams/unknown.svg"} 
                      alt={`${team.name} Logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </Link>
                {/* Hover Card */}
                <div className="absolute left-1/2 top-full mt-3 transform -translate-x-1/2 
                              bg-white border border-gray-200 rounded-lg shadow-md
                              px-3 py-2 whitespace-nowrap
                              opacity-0 group-hover:opacity-100 
                              transition-opacity duration-200 pointer-events-none z-10">
                  <div className="text-center p-0.5">
                    <div className="flex items-center justify-center gap-1.5 font-medium text-gray-900 text-sm leading-tight">
                      <span>{team.name}</span>
                      <CountryFlag 
                        countryCode={team.country} 
                        size="w-6 h-4"
                        flagSize={20}
                      />
                    </div>
                  </div>
                </div>
                {/* ...sem botões de admin... */}
              </div>
            ))}
          </div>
          
          {/* Estado vazio */}
          {teams.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-gray-400">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum time encontrado</h3>
              <p className="text-gray-600">Não foi possível carregar os times no momento.</p>
            </div>
          )}
          
          {/* Estado de erro */}
          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-red-500">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
