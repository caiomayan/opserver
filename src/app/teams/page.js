'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import ReactCountryFlag from "react-country-flag";
import Layout from '../../components/Layout';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/teams`, {cache: 'no-store'});
        
        if (res.ok) {
          const data = await res.json();
          setTeams(data);
        } else {
          throw new Error('Erro ao carregar times');
        }
      } catch (error) {
  setError(error.message);
        setError(error.message);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Loading state
  if (loading) {
    return (
      <LoadingScreen 
        message="Carregando times..."
        subMessage="Buscando informações dos teams profissionais"
      />
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          {/* Grid de logos dos times */}
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
            {teams.map((team) => (
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
                      <ReactCountryFlag 
                        countryCode={team.country} 
                        svg 
                        style={{width: '0.9em', height: '0.9em'}} 
                      />
                    </div>
                  </div>
                </div>
                {/* Permissões: admins podem ver botões de editar/excluir times */}
                {isAdmin && (
                  <div className="flex justify-center gap-2 mt-2">
                    <button className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200">Editar Time</button>
                    <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Excluir Time</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Estado vazio */}
          {teams.length === 0 && !loading && (
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
