import { useState, useEffect } from 'react';

export const useFaceitData = (steamId) => {
  const [faceitData, setFaceitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!steamId) {
      setLoading(false);
      return;
    }

    console.log('🔍 FACEIT Hook: Iniciando busca para Steam ID:', steamId);

    const fetchFaceitData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/faceit/${steamId}`);
        
        console.log('🔍 FACEIT Hook: Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ FACEIT Hook: Dados recebidos:', data);
          setFaceitData(data);
        } else if (response.status === 404) {
          // Jogador não tem conta FACEIT - não é erro
          console.log('ℹ️ FACEIT Hook: Jogador não encontrado no FACEIT (404)');
          setFaceitData(null);
        } else {
          console.log('❌ FACEIT Hook: Erro HTTP:', response.status);
          throw new Error('Failed to fetch FACEIT data');
        }
      } catch (err) {
        console.error('❌ FACEIT Hook: Erro na requisição:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFaceitData();
  }, [steamId]);

  return { faceitData, loading, error };
};
