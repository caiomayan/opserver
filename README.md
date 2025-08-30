# OPSERVER

> Um hub completo e profissional para equipes de Counter-Strike 2, desenvolvido para mostrar estatísticas, configurações e perfis de jogadores de forma elegante e minimalista.

## 🚀 Sobre o Projeto

O **OPSERVER** nasceu da necessidade de ter uma plataforma centralizada onde jogadores e equipes de CS2 possam exibir suas informações de forma profissional. Mais do que apenas um site, é uma ferramenta que conecta dados do Steam para criar perfis completos e atualizados automaticamente.

## 🛠️ Tecnologias Utilizadas

### **Frontend & Framework**
- **Next.js**
- **React**
- **Tailwind CSS**

### **Deploy & Infraestrutura**
- **Vercel** - Plataforma de deploy com integração GitHub
- **Git & GitHub** - Controle de versão e CI/CD automático

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
    └── platforms/          # Ícones Steam
```
