# CS2 Server Status Integration - ✅ COMPLETED

> **Status: FULLY OPERATIONAL** - All features implemented and tested successfully!

## Visão Geral

Sistema de integração em tempo real para monitoramento de servidores Counter-Strike 2 usando Steam Web API e vanilla JavaScript.

## Funcionalidades

- ✅ **Dados em tempo real**: Mapa atual, jogadores online, status do servidor
- ✅ **Auto-atualização**: Configurable interval (padrão: 30 segundos)
- ✅ **Tratamento de erros**: Retry automático e fallback para modo offline
- ✅ **Dados mock**: Para desenvolvimento sem API key
- ✅ **Debug mode**: Controles de desenvolvimento e logs detalhados
- ✅ **UI responsiva**: Atualização automática dos elementos HTML
- ✅ **CORS handling**: Proxy automático para contornar limitações de CORS

## Configuração

### 1. Steam API Key

Para obter dados reais do servidor, você precisa de uma Steam API Key:

1. Acesse: https://steamcommunity.com/dev/apikey
2. Faça login com sua conta Steam
3. Registre um domínio (pode usar `localhost` para desenvolvimento)
4. Copie a API Key gerada

### 2. Configurar a API Key

Edite o arquivo `src/server-config.js`:

```javascript
export const SERVER_CONFIG = {
  // Cole sua Steam API Key aqui
  STEAM_API_KEY: process.env.STEAM_API_KEY || '',
  
  // Configurações do servidor CS2
  SERVER_IP: process.env.SERVER_IP || '127.0.0.1',
  SERVER_PORT: process.env.SERVER_PORT || '27015',
  
  // ... outras configurações
};
```

### 3. Configurações do Servidor

Para monitorar um servidor diferente, altere as configurações:

```javascript
export const SERVER_CONFIG = {
  SERVER_IP: 'SEU_IP_AQUI',
  SERVER_PORT: 'SUA_PORTA_AQUI',
  // ...
};
```

## Estrutura de Arquivos

```
src/
├── cs2-server-status.js     # Classe principal de integração
├── server-config.js         # Configurações centralizadas
└── scroll-effects.js        # Sistema de efeitos de scroll
```

## Classes Principais

### CS2ServerStatus

Classe principal para monitoramento do servidor:

```javascript
// Inicialização
const serverStatus = new CS2ServerStatus({
  updateInterval: 30000, // 30 segundos
  maxRetries: 3
});

// Métodos principais
await serverStatus.fetchServerData();          // Buscar dados uma vez
serverStatus.startAutoUpdate(callback);       // Iniciar atualizações automáticas
serverStatus.stopAutoUpdate();                // Parar atualizações
serverStatus.updateUI(data);                   // Atualizar interface
```

### ServerStatusManager

Gerenciador de alto nível com funcionalidades extras:

```javascript
// Auto-inicialização
const manager = new ServerStatusManager();

// Controles
manager.start();                              // Iniciar monitoramento
manager.stop();                               // Parar monitoramento
await manager.refreshNow();                   // Atualizar agora
const status = manager.getCurrentStatus();    // Obter status atual
```

## Dados Retornados

```javascript
{
  name: "A GREAT CHAOS 01",
  map: "Dust II",                    // Nome formatado do mapa
  players: {
    current: 12,
    max: 32
  },
  status: "online",                  // "online" | "offline" | "unknown"
  ping: 25,                          // em ms
  gameMode: "Competitive",           // Modo de jogo formatado
  secure: true,                      // VAC enabled
  lastUpdate: "2025-06-12T15:30:00Z" // ISO timestamp
}
```

## Elementos HTML Atualizados

O sistema atualiza automaticamente os seguintes elementos na página:

- **Status do servidor**: Indicador online/offline com cor
- **Mapa atual**: Nome formatado do mapa (ex: "de_dust2" → "Dust II")
- **Contagem de jogadores**: "12/32"
- **Modo de jogo**: "Competitive", "Casual", etc.
- **Latência**: Ping em ms
- **Indicador visual**: Dot colorido (verde=online, vermelho=offline)

## Desenvolvimento

### Modo Debug

Em desenvolvimento (localhost), o sistema automaticamente:

- Usa dados mock se não há API key configurada
- Mostra controles de debug no canto superior direito
- Exibe logs detalhados no console
- Mostra informações de última atualização

### Controles de Debug

- **Refresh Now**: Força atualização imediata
- **Stop/Start Updates**: Pausa/retoma atualizações automáticas
- **Mock Offline**: Simula servidor offline para testes

### Dados Mock

Quando não há API key configurada, o sistema usa dados simulados:

- Mapas aleatórios do pool do CS2
- Contagem de jogadores variável
- Status online/offline (90% chance online)
- Ping simulado (15-55ms)

## API Steam

### Endpoints Utilizados

- **GetServerList**: Lista servidores por IP/porta
- **GetServersAtAddress**: Informações detalhadas do servidor

### Rate Limits

A Steam API tem limitações de rate limit. O sistema implementa:

- Retry automático com backoff
- Timeout configurável (10s padrão)
- Máximo de tentativas (3 padrão)

## CORS e Proxy

Para contornar limitações de CORS:

- Usa proxy `api.allorigins.win` por padrão
- Configurável em `server-config.js`
- Fallback para requisições diretas se disponível

## Eventos Personalizados

O sistema dispara eventos para integração com outros scripts:

```javascript
// Escutar atualizações de status
window.addEventListener('serverStatusUpdate', (event) => {
  const serverData = event.detail;
  console.log('Server updated:', serverData);
});
```

## Troubleshooting

### Servidor não aparece como online

1. Verifique se o IP e porta estão corretos
2. Confirme se o servidor está realmente online
3. Teste com dados mock para verificar a UI
4. Verifique console para erros de API

### CORS errors

1. Certifique-se que o proxy está configurado
2. Teste em ambiente de produção (não localhost)
3. Configure servidor próprio para proxy se necessário

### API Key inválida

1. Verifique se a key foi copiada corretamente
2. Confirme se o domínio está registrado na Steam
3. Teste com dados mock primeiro

## Produção

Para ambiente de produção:

1. Configure API key válida
2. Ajuste `updateInterval` se necessário (mínimo recomendado: 30s)
3. Desabilite `DEBUG_MODE` em `server-config.js`
4. Considere implementar cache server-side

## Suporte

Para problemas ou dúvidas:

- Verifique logs do navegador (F12 → Console)
- Teste com dados mock primeiro
- Confirme configurações de API
- Verifique status do servidor externamente
