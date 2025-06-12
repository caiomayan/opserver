# OpServer
![Logotipo do projeto](https://github.com/caiomayan/OpServer/blob/main/public/img/preview.png?raw=true)

## Sobre
OpServer é uma plataforma para gerenciamento e monitoramento de servidores Counter-Strike 2, com foco em experiência premium e profissionalismo.

## Funcionalidades
- Monitoramento em tempo real do status dos servidores
- Integração com a Steam Web API
- Sistema de cache para melhorar performance
- Detecção de servidores VPN
- Suporte multi-idioma (PT/EN)
- Interface responsiva

## Instalação

### Pré-requisitos
- Node.js v18 ou superior
- NPM v9 ou superior
- Uma chave API da Steam ([Obtenha aqui](https://steamcommunity.com/dev/apikey))

### Configuração
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/OpServer.git
   cd OpServer
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

4. Edite o arquivo `.env` e adicione sua chave API da Steam e outras configurações

5. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Segurança
Este projeto utiliza variáveis de ambiente para gerenciar dados sensíveis como chaves de API e endereços de servidores. **Nunca compartilhe seu arquivo .env ou comprometa dados sensíveis no código fonte.**

Para mais informações sobre segurança, consulte [SECURITY.md](SECURITY.md).

## Produção
Para gerar os arquivos para produção:
```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## Estrutura do Projeto
- `/src` - Código fonte principal
- `/public` - Assets estáticos
- `/docs` - Documentação
- `/tests` - Arquivos de teste

## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.
