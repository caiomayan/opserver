// Teste de validação de formulário
const testData = [
  { id: 'test123456', name: 'Test Team', valid: false, reason: 'ID muito longo (10+ chars)' },
  { id: 'test12345', name: 'Test Team', valid: true, reason: 'ID ok (9 chars)' },
  { id: '', name: 'Test Team', valid: false, reason: 'ID vazio' },
  { id: 'ok', name: '', valid: false, reason: 'Nome vazio' },
  { id: 'ok', name: 'Este nome tem mais de vinte caracteres', valid: false, reason: 'Nome muito longo (20+ chars)' },
  { id: 'ok', name: 'Nome Válido', valid: true, reason: 'Tudo ok' }
];

function validateTeamForm(formData) {
  const errors = {};
  
  if (!formData.id.trim()) {
    errors.id = 'ID é obrigatório';
  } else if (formData.id.length >= 10) {
    errors.id = 'ID deve ter menos de 10 caracteres';
  }
  
  if (!formData.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (formData.name.length >= 20) {
    errors.name = 'Nome deve ter menos de 20 caracteres';
  }

  return Object.keys(errors).length === 0;
}

console.log('=== TESTE DE VALIDAÇÃO DE FORMULÁRIO ===\n');

testData.forEach((test, index) => {
  const isValid = validateTeamForm(test);
  const status = isValid === test.valid ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ID: "${test.id}" | Nome: "${test.name}"`);
  console.log(`   Esperado: ${test.valid ? 'Válido' : 'Inválido'} (${test.reason})`);
  console.log(`   Resultado: ${isValid ? 'Válido' : 'Inválido'}\n`);
});
