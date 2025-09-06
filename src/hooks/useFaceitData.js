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

    const fetchFaceitData = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/faceit/${steamId}`);

        if (response.ok) {
          const data = await response.json();
          setFaceitData(data);
        } else if (response.status === 404) {
          // Jogador não tem conta FACEIT - não é erro
          setFaceitData(null);
        } else {
          throw new Error('Failed to fetch FACEIT data');
        }
      } catch (err) {
        console.error('Error fetching FACEIT data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFaceitData();
  }, [steamId]);

  return { faceitData, loading, error };
};
