# 🔧 Guia de Deployment Seguro - OpServer

## 🔐 GitHub Actions Secrets

Para que o site funcione corretamente em produção, você precisa configurar **apenas 1 secret** no GitHub:

### **Navegue para Secrets:**
1. Vá para `Settings` → `Secrets and variables` → `Actions`
2. Clique em `New repository secret`

### **Secret Necessário:**

| Nome do Secret | Valor | Descrição |
|----------------|-------|-----------|
| `STEAM_API_KEY` | `1270A62C1573C745CB26B8526242F0BD` | Sua Steam API Key (OBRIGATÓRIO) |

## Como funciona a configuração

### Dados hardcoded no código (não sensíveis):
- **SERVER_IP**: `177.54.144.181` - IP público do servidor
- **SERVER_PORT**: `27084` - Porta pública do servidor  
- **SERVER_NAME**: `A GREAT CHAOS 01` - Nome fictício para exibição
- **SERVER_REGION**: `Brasil` - Região padrão (atualizada dinamicamente via IP geolocation)

### Dados injetados via GitHub Secrets (sensíveis):
- **STEAM_API_KEY**: Chave privada da Steam API

## 🚀 Deployment

### **Automático:**
- Push para branch `main` → Deploy automático via GitHub Actions

### **Manual:**
- Vá para `Actions` → `Deploy to GitHub Pages` → `Run workflow`

## 🔍 Verificação

Após o deploy, verifique:
1. Site carrega corretamente
2. IP do servidor aparece corretamente na página `servers.html`
3. Console do navegador mostra configuração carregada com o IP correto
4. Status do servidor é detectado automaticamente

## 🛠️ Estrutura Simplificada

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  GitHub Secret  │───▶│  GitHub Actions │───▶│   Build Final   │
│ (STEAM_API_KEY) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       │
                       ┌─────────────────┐              │
                       │   .env.local    │              │
                       │ (Steam API Key) │              │
                       │ VITE_STEAM_API  │              │
                       │_KEY=1270A62...  │              │
                       └─────────────────┘              │
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   Frontend      │
                                               │ (Configuração   │
                                               │   Completa)     │
                                               └─────────────────┘
```

## ⚠️ Arquitetura de Segurança

### **Dados Sensíveis:**
- **Steam API Key**: Injetada durante build via GitHub Actions
- **Nunca** commitada no código fonte
- **Apenas** acessível no ambiente de build

### **Dados Públicos:**
- **IP/Porta do servidor**: Hardcoded no código (não sensível, visível publicamente mesmo)
- **Nome do servidor**: Fictício para demonstração
- **Região**: Detectada automaticamente

### **Por que essa abordagem é segura:**
1. **Steam API Key** nunca fica exposta no código
2. **IP/Porta** são dados públicos (qualquer um pode ver um servidor CS2 online)
3. **Sem endpoints de API** desnecessários
4. **Deployment estático** mais simples e seguro

## 🧪 Testando Localmente

Para testar localmente, crie um arquivo `.env.local`:

```bash
# .env.local (não commitar!)
VITE_STEAM_API_KEY=1270A62C1573C745CB26B8526242F0BD
```

Depois execute:
```bash
npm run dev
```

## ✅ Status do Projeto

- ✅ **Build funcionando**: 34.80 kB gzipped
- ✅ **Configuração simplificada**: Apenas 1 secret necessário
- ✅ **Código limpo**: Removidas dependências de API desnecessárias
- ✅ **Deploy automático**: GitHub Actions configurado
- ⏳ **Próximo passo**: Configurar `STEAM_API_KEY` no GitHub e testar deploy
