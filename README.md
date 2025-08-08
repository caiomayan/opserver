# OPSERVER

> Um hub completo e profissional para equipes de Counter-Strike 2, desenvolvido para mostrar estatísticas, configurações e perfis de jogadores de forma elegante e minimalista.

## 🚀 Sobre o Projeto

O **OPSERVER** nasceu da necessidade de ter uma plataforma centralizada onde jogadores e equipes de CS2 possam exibir suas informações de forma profissional. Mais do que apenas um site, é uma ferramenta que conecta dados do GamersClub e Steam para criar perfis completos e atualizados automaticamente.

### 🎯 **Intenção Principal**

Este projeto foi criado com o objetivo de:

- **Profissionalizar a apresentação** de equipes amadoras e semi-profissionais
- **Centralizar informações** que normalmente ficam espalhadas em diferentes plataformas
- **Automatizar a coleta de dados** através de APIs para manter tudo sempre atualizado
- **Criar uma identidade visual limpa** que reflita seriedade e profissionalismo
- **Facilitar o networking** entre jogadores e organizações do cenário

O foco está em transformar dados brutos em uma experiência visual atrativa, onde cada jogador tem seu perfil completo com configurações, estatísticas e informações pessoais organizadas de forma intuitiva.

## 🛠️ Tecnologias Utilizadas

### **Frontend & Framework**
- **Next.js**
- **React**
- **Tailwind CSS**

### **Deploy & Infraestrutura**
- **Vercel** - Plataforma de deploy com integração GitHub
- **Git & GitHub** - Controle de versão e CI/CD automático

## ✨ Funcionalidades Principais

### 🏆 **Sistema de Equipes**
- Visualização de todas as equipes com logos e informações
- Páginas individuais para cada equipe
- Listagem automática dos membros com hover effects elegantes

### 👤 **Perfis de Jogadores**
- **Configurações detalhadas**: Sensibilidade, DPI, eDPI calculado
- **Informações pessoais**: Idade, país, links para Steam/GamersClub  
- **Integração Steam**: Avatars atualizados automaticamente
- **Levels GamersClub**: Níveis atualizados via scraping

### 🎨 **Design & UX**
- Interface minimalista e profissional
- Animações suaves e micro-interações
- Design responsivo para todos os dispositivos
- Efeitos hover avançados nos cards de jogadores

### ⚙️ **Painel Administrativo**
- Gerenciamento de jogadores e equipes
- Formulários intuitivos para adição/edição
- Validação de dados em tempo real

## 📁 Estrutura do Projeto

```
opserver/
├── src/app/
│   ├── page.js              # Landing page com animação de typing
│   ├── teams/page.js        # Listagem de todas as equipes
│   ├── team/[id]/page.js    # Página individual da equipe
│   ├── player/[id]/page.js  # Perfil completo do jogador
│   ├── admin/page.js        # Painel administrativo
│   └── api/                 # Endpoints da API
│       ├── players/route.js # API dos jogadores com integração Steam/GC
│       ├── teams/route.js   # API das equipes
│       └── admin/route.js   # API administrativa
├── data/
│   ├── players.json         # Banco de dados dos jogadores
│   └── teams.json          # Banco de dados das equipes
└── public/
    ├── teams/              # Logos das equipes
    └── platforms/          # Ícones Steam/GamersClub
```

## 🎯 Futuras Implementações

- [ ] Sistema de estatísticas avançadas
- [ ] Integração com FACEIT API
- [ ] Dashboard para organizações
- [ ] Sistema de matches e resultados
- [ ] Export de dados para redes sociais
- [ ] Modo escuro/claro
- [ ] Multilingual support
---
