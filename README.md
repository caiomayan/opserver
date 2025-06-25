# OPSERVER

Uma plataforma profissional para servidores Counter-Strike 2 com sistema de skins gratuitas.

## Características

- Monitoramento em tempo real de servidores CS2
- Sistema de inventário de skins gratuitas integrado
- Interface moderna e responsiva
- Cache inteligente para otimização de performance

## Tecnologias

- HTML5, CSS3, JavaScript (Vanilla)
- Vite para build e desenvolvimento
- Steam Web API para dados dos servidores

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/opserver.git

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Estrutura

```
├── src/
│   ├── style.css
│   ├── cs2-server-status-final.js
│   ├── server-cache.js
│   └── scroll-effects-minimal.js
├── public/img/
├── main.html
├── servers.html
├── about.html
└── index.html
```

## Deploy

Build estático pronto para qualquer servidor web. Execute `npm run build` e hospede a pasta `dist/`.
