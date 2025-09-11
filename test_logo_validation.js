// Teste da validação de logo corrigida
function validateLogo(logoValue) {
  if (!logoValue || !logoValue.trim()) return true; // Opcional
  
  const logo = logoValue.trim();
  
  // Aceitar caminhos relativos (começando com /) ou URLs completas
  if (logo.startsWith('/')) {
    // Caminho relativo - verificar se termina com extensão de imagem
    return logo.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i) !== null;
  } else {
    // URL completa - validar formato
    try {
      new URL(logo);
      return logo.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i) !== null;
    } catch {
      return false;
    }
  }
}

const testCases = [
  { input: '/teams/opium.svg', expected: true, desc: 'Caminho relativo válido' },
  { input: '/teams/logo.png', expected: true, desc: 'Caminho relativo PNG' },
  { input: 'https://example.com/logo.svg', expected: true, desc: 'URL completa válida' },
  { input: '/teams/logo.txt', expected: false, desc: 'Caminho com extensão inválida' },
  { input: 'invalid-url', expected: false, desc: 'String inválida' },
  { input: '', expected: true, desc: 'String vazia (opcional)' },
  { input: '/teams/logo.SVG', expected: true, desc: 'Extensão maiúscula' }
];

console.log('=== TESTE DE VALIDAÇÃO DE LOGO ===\n');

testCases.forEach((test, index) => {
  const result = validateLogo(test.input);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${status} "${test.input}" - ${test.desc}`);
  console.log(`   Esperado: ${test.expected}, Resultado: ${result}\n`);
});
