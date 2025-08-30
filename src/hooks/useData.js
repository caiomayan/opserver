'use client';

import { useState, useEffect } from 'react';
import { fetchWithErrorHandling, getBaseUrl } from '../utils/apiUtils';
import { supabase } from '../lib/supabase';

// ...existing code...
export const usePlayers = (teamId = null, playerIds = null, refresh = false) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      let query = supabase.from('players').select('*');
      if (teamId) query = query.eq('teamId', teamId);
      if (playerIds) query = query.in('steamid64', playerIds.split(','));
      const { data, error } = await query;
      if (error) setError(error.message);
      setPlayers(data || []);
      setLoading(false);
    };
    fetchPlayers();
  }, [teamId, playerIds, refresh]);

  return { players, loading, error };
};

/**
 * Hook para buscar dados de teams
 * @returns {object} - Estado dos dados
 */
export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('teams').select('*');
      if (error) setError(error.message);
      setTeams(data || []);
      setLoading(false);
    };
    fetchTeams();
  }, []);

  return { teams, loading, error };
};
