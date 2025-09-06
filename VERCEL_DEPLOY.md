# Guia de Deploy no Vercel - Correções Aplicadas

## ✅ Problemas Corrigidos

### 1. **Página de Teams em Branco**
- **Problema**: Dependência da variável `NEXT_PUBLIC_APP_URL` que não funcionava em produção
- **Solução**: Todas as chamadas de API agora usam URLs relativas (`/api/teams` em vez de `${baseUrl}/api/teams`)

### 2. **Avatares da Steam Não Carregam**
- **Problema**: Next.js bloqueia imagens externas por padrão
- **Solução**: Configurado `next.config.mjs` para permitir imagens dos domínios da Steam:
  - `avatars.steamstatic.com`
  - `steamcdn-a.akamaihd.net`
  - `steamuserimages-a.akamaihd.net`

## 🔧 Arquivos Modificados

### Frontend (URLs Relativas)
- `src/app/teams/page.jsx` - Página de times
- `src/app/player/[id]/page.jsx` - Página do jogador  
- `src/components/SteamAuth.jsx` - Componente de autenticação
- `src/hooks/useFaceitData.js` - Hook FACEIT
- `src/app/prosettings/page.jsx` - Página prosettings

### Configuração
- `next.config.mjs` - Permitir imagens externas da Steam

## 🌐 Variáveis de Ambiente para o Vercel

**No painel do Vercel, configure estas variáveis:**

```bash
# Steam API
STEAM_API_KEY=1270A62C1573C745CB26B8526242F0BD
STEAM_API_URL=https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/

# Supabase (Publicas)
NEXT_PUBLIC_SUPABASE_URL=https://bbaiivuvayfpzzoohusy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiYWlpdnV2YXlmcHp6b29odXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTY2MTcsImV4cCI6MjA3MDg3MjYxN30.JYM8V34SPqoZhA7cOnS6O2tDFuaE-2S9CrzMHRPIwpY

# FACEIT API
FACEIT_API_KEY=0e8c77f3-daa8-42ac-ac8b-ba823bb6ee8d

# Autenticação (IMPORTANTE: Use uma chave diferente em produção)
NEXTAUTH_SECRET=sua-chave-secreta-super-forte-aqui-produção
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

## 🚀 Passos para Deploy

### 1. **Configure as Variáveis no Vercel**
- Acesse o painel do Vercel
- Vá em Settings > Environment Variables
- Adicione todas as variáveis acima
- **IMPORTANTE**: Gere uma nova `NEXTAUTH_SECRET` forte para produção

### 2. **Configure o Domínio**
- Substitua `NEXTAUTH_URL` pelo seu domínio real do Vercel
- Exemplo: `https://opserver.vercel.app`

### 3. **Deploy**
- Faça push do código para o repositório
- O Vercel vai fazer deploy automaticamente
- Verifique se não há erros no build

## ✅ Verificações Pós-Deploy

### Teste estas URLs no seu domínio:
- `https://seu-dominio.vercel.app/teams` - Deve mostrar os times
- `https://seu-dominio.vercel.app/api/teams` - Deve retornar JSON dos times
- `https://seu-dominio.vercel.app/api/auth/steam` - Deve redirecionar para Steam

### Avatares da Steam:
- Login via Steam deve funcionar
- Avatares devem carregar nas páginas dos jogadores
- Imagens da Steam devem aparecer sem erro de CORS

## 🔒 Segurança em Produção

⚠️ **ATENÇÃO**: Mude a `NEXTAUTH_SECRET` para uma chave forte diferente em produção!

Gere uma nova chave:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🎯 Benefícios das Correções

1. **URLs Relativas**: Funciona automaticamente em qualquer domínio
2. **Imagens Steam**: Avatares carregam sem problemas de CORS
3. **Serverless**: 100% compatível com Vercel
4. **Performance**: Cache otimizado das APIs
5. **Segurança**: JWT stateless com httpOnly cookies

Agora seu site deve funcionar perfeitamente no Vercel! 🚀
