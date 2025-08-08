# OPSERVER - CS2 Professional Hub

## 🚀 Deploy no Vercel

### 1. **Configurar Variáveis de Ambiente**

No Vercel Dashboard, adicione estas variáveis:

```bash
# GamersClub API
GAMERSCLUB_API_KEY=your_gamersclub_api_key_here
GAMERSCLUB_BASE_URL=https://gamersclub.com.br/

# Steam API  
STEAM_API_KEY=your_steam_api_key_here
STEAM_API_URL=http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/

# App URL (será automaticamente definida pelo Vercel)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### 2. **Deploy Steps**

```bash
# 1. Push para GitHub
git add .
git commit -m "Deploy ready"
git push origin main

# 2. No Vercel:
# - Conecte o repositório GitHub
# - Configure as variáveis de ambiente
# - Deploy automático!
```

### 3. **Funcionalidades**

- ✅ Multi-page hub navegável
- ✅ Teams database with logos
- ✅ Player profiles with Steam avatars
- ✅ GamersClub level integration
- ✅ Admin panel for management
- ✅ Responsive design
- ✅ Professional animations

### 4. **APIs Utilizadas**

- **GamersClub API**: Player levels
- **Steam API**: Player avatars
- **JSON Database**: Teams and players data

---

## Getting Started (Development)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Desenvolvimento em Next.js 15 + Tailwind CSS**
