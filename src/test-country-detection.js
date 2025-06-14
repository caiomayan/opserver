// Test script para verificar a detecção de países
// Execute este script no console do navegador para testar a funcionalidade

async function testCountryDetection() {
  console.log('🧪 Iniciando teste de detecção de países...');
  
  // IPs de teste de diferentes países
  const testIPs = [
    { ip: '177.54.144.181', expected: 'br', description: 'Servidor brasileiro (seu servidor)' },
    { ip: '8.8.8.8', expected: 'us', description: 'Google DNS (EUA)' },
    { ip: '1.1.1.1', expected: 'us', description: 'Cloudflare DNS (EUA)' },
    { ip: '208.67.222.222', expected: 'us', description: 'OpenDNS (EUA)' },
    { ip: '185.228.168.9', expected: 'de', description: 'Servidor alemão' }
  ];
  
  if (window.cs2ServerStatus) {
    for (const test of testIPs) {
      console.log(`\n🌍 Testando ${test.description}: ${test.ip}`);
      try {
        const result = await window.cs2ServerStatus.getCountryFromIP(test.ip);
        const success = result === test.expected;
        console.log(`${success ? '✅' : '❌'} Resultado: ${result} (esperado: ${test.expected})`);
      } catch (error) {
        console.error(`❌ Erro no teste: ${error.message}`);
      }
    }
  } else {
    console.error('❌ window.cs2ServerStatus não está disponível');
  }
  
  console.log('\n🏁 Teste concluído!');
}

// Executar o teste
testCountryDetection();
