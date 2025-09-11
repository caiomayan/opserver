// Teste específico para a página admin/teams
const BASE_URL = 'http://localhost:3000';

async function testTeamsPageAPICalls() {
  console.log('=== TESTE: Simulando chamadas da página admin/teams ===\n');

  // 1. Teste de fetch inicial (sem autenticação)
  console.log('1. Teste fetchTeams() sem autenticação:');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/teams`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    console.log(`Erro de rede: ${error.message}`);
  }

  console.log('\n2. Teste fetchTeamStats() sem autenticação:');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/teams/stats`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    console.log(`Erro de rede: ${error.message}`);
  }

  // 3. Teste de criação de time (POST) sem autenticação
  console.log('\n3. Teste handleSaveTeam() POST sem autenticação:');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'test-team',
        name: 'Test Team',
        countryid: 'BR',
        logo: '/teams/test.svg'
      })
    });
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    console.log(`Erro de rede: ${error.message}`);
  }

  // 4. Teste de atualização de time (PUT) sem autenticação
  console.log('\n4. Teste handleSaveTeam() PUT sem autenticação:');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/teams`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'furia',
        name: 'FURIA Updated',
        countryid: 'BR',
        logo: '/teams/furia.svg'
      })
    });
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    console.log(`Erro de rede: ${error.message}`);
  }

  // 5. Teste de exclusão de time (DELETE) sem autenticação
  console.log('\n5. Teste handleDeleteTeam() sem autenticação:');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/teams?id=test-team`, {
      method: 'DELETE'
    });
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    console.log(`Erro de rede: ${error.message}`);
  }
}

testTeamsPageAPICalls();
