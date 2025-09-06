'use client';

import { useState, useEffect } from 'react';

export default function TeamsTestPage() {
  const [status, setStatus] = useState('Loading...');
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        // Teste 1: API teams
        const teamsRes = await fetch('/api/teams');
        const teamsData = await teamsRes.json();
        
        if (teamsRes.ok) {
          setTeams(teamsData.data || []);
          setStatus('API working - Teams loaded');
        } else {
          throw new Error(`API Error: ${teamsRes.status} - ${teamsData.error}`);
        }
        
      } catch (err) {
        setError(err.message);
        setStatus('Error occurred');
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Teams Page Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Status: {status}</h2>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Teams Data ({teams.length} teams found):</h2>
        {teams.map((team) => (
          <div key={team.id} style={{ 
            border: '1px solid #ccc', 
            margin: '10px 0', 
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>{team.name} ({team.id})</h3>
            <p>Country: {team.countryid}</p>
            <p>Logo: {team.logo}</p>
            {team.logo && (
              <img 
                src={team.logo} 
                alt={team.name}
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.border = '2px solid red';
                  e.target.alt = 'FAILED TO LOAD';
                }}
                onLoad={(e) => {
                  e.target.style.border = '2px solid green';
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div>
        <h2>Test Results:</h2>
        <p>✅ Page loaded</p>
        <p>✅ React hooks working</p>
        <p>✅ Fetch API working</p>
        {teams.length > 0 && <p>✅ Teams API returning data</p>}
        {error && <p>❌ Error occurred: {error}</p>}
      </div>
    </div>
  );
}
