# Política de Segurança

## Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança no OpServer, por favor nos avise imediatamente para que possamos tomar medidas para corrigi-la.

Para reportar uma vulnerabilidade:

1. **NÃO** crie um issue público no GitHub para vulnerabilidades de segurança
2. Envie um email para [seu-email@exemplo.com] com os detalhes da vulnerabilidade
3. Inclua etapas para reprodução, impacto potencial, e se possível, uma sugestão de correção

## Dados Sensíveis

Este projeto gerencia dados sensíveis como:

- Chaves de API da Steam
- Endereços IP de servidores
- Configurações de conexão

### Como Protegemos Dados Sensíveis

1. **Variáveis de Ambiente**: Todos os dados sensíveis são armazenados em variáveis de ambiente
2. **Arquivo .env**: Nunca commitamos o arquivo .env para o repositório
3. **Modelo .env.example**: Fornecemos um modelo sem valores reais

### Práticas de Segurança Recomendadas

Se você for contribuir ou fazer um fork deste repositório:

1. Nunca commite chaves de API, senhas ou credenciais no código fonte
2. Sempre use variáveis de ambiente para dados sensíveis
3. Mantenha suas dependências atualizadas
4. Revise regularmente seu código para possíveis problemas de segurança

## Atualizações de Segurança

Atualizações de segurança são aplicadas assim que vulnerabilidades são encontradas e corrigidas. Recomendamos que você mantenha seu fork ou instalação atualizada com as últimas correções.
