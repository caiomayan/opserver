'use client';

import { useState, useEffect } from 'react';

export const usePlayers = (teamId = null, playerIds = null, refresh = false) => {
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [errorPlayers, setErrorPlayers] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      setErrorPlayers(null);
      try {
        let url = '/api/players';
        const params = [];
        if (teamId) params.push(`teamid=${teamId}`);
        if (playerIds) params.push(`playerIds=${playerIds}`);
        if (params.length) url += `?${params.join('&')}`;
        const res = await fetch(url);
        const result = await res.json();
        setPlayers(result.data || []);
      } catch (err) {
        setErrorPlayers(err.message);
        setPlayers([]);
      } finally {
        setLoadingPlayers(false);
      }
    };
    fetchPlayers();
  }, [teamId, playerIds, refresh]);

  return { players, loading: loadingPlayers, error: errorPlayers };
};

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [errorTeams, setErrorTeams] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      setErrorTeams(null);
      try {
        const res = await fetch('/api/teams');
        const result = await res.json();
        setTeams(result.data || []);
      } catch (err) {
        setErrorTeams(err.message);
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, []);

  return { teams, loading: loadingTeams, error: errorTeams };
};