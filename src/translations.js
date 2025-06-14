class TranslationSystem {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.translations = {pt: {
        // Page Title
        'page.title': 'Bem-vindo',
        'page.servers.title': 'Servidores',
          // Navigation
        'nav.about': 'SOBRE',
        'nav.servers': 'SERVIDORES',
        'nav.inventory': 'INVENTÁRIO',
        'nav.community': 'COMUNIDADE',
        'nav.menu': 'Menu',
        'nav.close': 'Fechar',
        
        // Hero Section
        'hero.title': 'OPSERVER',
        'hero.subtitle': 'Um Grande Caos',
        'hero.cta': 'JOGAR',
        
        // About Section
        'about.title': 'EXPERIÊNCIA PREMIUM',
        'about.description': 'Uma experiência incomparável, com infraestrutura premium de servidores. Construído para jogadores que exigem excelência, competitividade e profissionalismo.',
        'about.servers': 'SERVIDORES ONLINE',
        
        // Inventory Section
        'inventory.title': 'INVENTÁRIO',
        'inventory.subtitle': 'Acesse seu inventário online para escolher e personalizar suas skins favoritas',
        'inventory.system.title': 'Inventário de skins',
        'inventory.system.description': 'Nosso servidor utiliza um sistema de inventário online que simula perfeitamente o inventário do CS2 real. Escolha entre milhares de skins disponíveis e personalize seu equipamento antes de entrar no jogo.',
        'inventory.how.title': 'Como funciona:',
        'inventory.how.step1': 'Conecte-se a Steam ao entrar no link',
        'inventory.how.step2': 'Agora sim, escolha suas skins favoritas criando itens',
        'inventory.how.step3': 'Entre no servidor e suas skins aparecerão automaticamente',
        'inventory.how.step4': 'E caso você altere em jogo, relogue para aplicar as mudanças',
        'inventory.access': 'Ir para o inventário',
        'inventory.feature1.title': 'Todas as skins',
        'inventory.feature1.desc': 'Acesso a todas as skins do CS2, incluindo as mais raras',
        'inventory.feature2.title': 'Aplicação instantânea',
        'inventory.feature2.desc': 'Suas skins aparecem imediatamente ao entrar no servidor',
        'inventory.feature3.title': 'Fácil configuração',
        'inventory.feature3.desc': 'Interface intuitiva e simples de usar',
        'inventory.feature4.title': 'Gratuito',
        'inventory.feature4.desc': 'Todas as skins disponíveis sem custo adicional',
        
        // Community Section
        'community.title': 'COMUNIDADE',
        'community.subtitle': 'Junte-se à nossa comunidade exclusiva no Discord para atualizações, conexões, torneios e suporte direto',
        'community.discord.subtitle': 'A Great Chaos',
        'community.members': 'Membros',
        'community.support': 'Suporte',
        'community.description': 'Acesso a canais exclusivos, funcionalidades e configurações, suporte técnico e conexão direta com outros jogadores da comunidade.',
        'community.join': 'Entrar no Discord',
        
        // Servers Section (Nova página)
        'servers.title': 'NOSSOS SERVIDORES',
        'servers.subtitle': 'Informações detalhadas sobre todos os nossos servidores',        'servers.server.title': '?',
        'servers.server.map': 'Mapa',
        'servers.server.players': 'Jogadores',
        'servers.server.mode': 'Modo',
        'servers.server.region': 'País',
        'servers.server.latency': 'Ping',
        'servers.server.connect': 'Conectar via Steam',
        'servers.server.ip': 'IP do Servidor:',        'servers.server.copy': 'Copiar IP',
        'servers.server.toggle': 'Mostrar/Ocultar IP',
        'servers.map.current': 'MAPA ATUAL',        'servers.map.loading': 'Carregando informações...',        
        'servers.status.online': 'ONLINE',
        'servers.status.offline': 'OFFLINE', 
        'servers.status.unknown': 'DESCONHECIDO',
        'servers.status.checking': 'VERIFICANDO...',
        'servers.status.inconclusivel': 'INCONCLUSÍVEL',
        'servers.status.vpn': 'SERVIDOR VPN',
        
        'servers.features.title': 'DESTAQUES',
        'servers.feature1': '24/7 (em breve)',
        'servers.feature2': '128-tickrate',
        'servers.feature3': 'Plugins de anti-cheat',
        'servers.feature4': 'Integração com Discord',
        'servers.stats.title': 'Informações Técnicas',
        'servers.stats.capacity': 'Capacidade',
        'servers.stats.latency': 'Latência',
        'servers.stats.performance': 'Performance',
        'servers.stats.players': '14 Jogadores',
        'servers.stats.low': 'Baixa',
        'servers.stats.optimized': 'Otimizada',
        'servers.protection': 'Proteção',
        'servers.anticheat': 'Anti-Cheat',
        
        // Footer
        'footer.terms': 'Termos',
        'footer.privacy': 'Privacidade',
        'footer.support': 'Suporte',
        'footer.copyright': '© 2025 OpServer',
          // General
        'general.online': 'Online',
        'general.offline': 'Offline',
        'general.loading': 'Carregando...',
        'general.unknown': '?',
        'general.location': 'João Pessoa, PB',
          // Main Page Server Status
        'main.status.online': 'Online',
        'main.status.offline': 'Offline', 
        'main.status.checking': 'Verificando...',
        'main.status.unknown': 'Desconhecido',
        'main.status.vpn': 'Servidor VPN'
      },      en: {
        // Page Title
        'page.title': 'Welcome',
        'page.servers.title': 'Servers',
          // Navigation
        'nav.about': 'ABOUT',
        'nav.servers': 'SERVERS',
        'nav.inventory': 'INVENTORY',
        'nav.community': 'COMMUNITY',
        'nav.menu': 'Menu',
        'nav.close': 'Close',
        
        // Hero Section
        'hero.title': 'OPSERVER',
        'hero.subtitle': 'A Great Chaos',
        'hero.cta': 'PLAY',
        
        // About Section
        'about.title': 'PREMIUM EXPERIENCE',
        'about.description': 'An unparalleled experience with premium server infrastructure. Built for players who demand excellence, competitiveness and professionalism.',
        'about.servers': 'SERVERS ONLINE',
          // Inventory Section
        'inventory.title': 'INVENTORY',
        'inventory.subtitle': 'Access your online inventory to choose and customize your favorite skins',
        'inventory.system.title': 'Skin Inventory',
        'inventory.system.description': 'Our server uses an online inventory system that perfectly simulates the real CS2 inventory. Choose from thousands of available skins and customize your loadout before entering the game.',
        'inventory.how.title': 'How it works:',
        'inventory.how.step1': 'Connect to Steam when entering the link',
        'inventory.how.step2': 'Now yes, choose your favorite skins by creating items',
        'inventory.how.step3': 'Join the server and your skins will appear automatically',
        'inventory.how.step4': 'And if you change in-game, relog to apply the changes',
        'inventory.access': 'Go to inventory',
        'inventory.feature1.title': 'All skins',
        'inventory.feature1.desc': 'Access to all CS2 skins, including the rarest ones',
        'inventory.feature2.title': 'Instant application',
        'inventory.feature2.desc': 'Your skins appear immediately when joining the server',
        'inventory.feature3.title': 'Easy setup',
        'inventory.feature3.desc': 'Intuitive and simple interface to use',
        'inventory.feature4.title': 'Free',
        'inventory.feature4.desc': 'All skins available at no additional cost',
        
        // Community Section
        'community.title': 'COMMUNITY',
        'community.subtitle': 'Join our exclusive Discord community for updates, connections, tournaments and direct support',
        'community.discord.subtitle': 'A Great Chaos',
        'community.members': 'Members',
        'community.support': 'Support',
        'community.description': 'Access to exclusive channels, features and settings, technical support and direct connection with other community players.',
        'community.join': 'Join Discord',
        
        // Servers Section (Nova página)
        'servers.title': 'OUR SERVERS',
        'servers.subtitle': 'Detailed information about all our servers',        'servers.server.title': '?',
        'servers.server.map': 'Map',
        'servers.server.players': 'Players',
        'servers.server.mode': 'Mode',
        'servers.server.region': 'Country',
        'servers.server.latency': 'Ping',
        'servers.server.connect': 'Connect via Steam',
        'servers.server.ip': 'Server IP:',        'servers.server.copy': 'Copy IP',
        'servers.server.toggle': 'Show/Hide IP',
        'servers.map.current': 'CURRENT MAP',        'servers.map.loading': 'Loading information...',        
        'servers.status.online': 'ONLINE',
        'servers.status.offline': 'OFFLINE',
        'servers.status.unknown': 'UNKNOWN',
        'servers.status.checking': 'CHECKING...',
        'servers.status.inconclusivel': 'INCONCLUSIVE',
        'servers.status.vpn': 'VPN SERVER',
        
        'servers.features.title': 'HIGHLIGHTS',
        'servers.feature1': '24/7 (coming soon)',
        'servers.feature2': '128-tickrate',
        'servers.feature3': 'Anti-cheat plugins',
        'servers.feature4': 'Discord integration',
        'servers.stats.title': 'Technical Information',
        'servers.stats.capacity': 'Capacity',
        'servers.stats.latency': 'Latency',
        'servers.stats.performance': 'Performance',
        'servers.stats.players': '14 Players',
        'servers.stats.low': 'Low',
        'servers.stats.optimized': 'Optimized',
        'servers.protection': 'Protection',
        'servers.anticheat': 'Anti-Cheat',
        
        // Footer
        'footer.terms': 'Terms',
        'footer.privacy': 'Privacy',
        'footer.support': 'Support',
        'footer.copyright': '© 2025 OpServer',
          // General
        'general.online': 'Online',
        'general.offline': 'Offline',
        'general.loading': 'Loading...',
        'general.unknown': '?',
        'general.location': 'João Pessoa, PB',
          // Main Page Server Status
        'main.status.online': 'Online',
        'main.status.offline': 'Offline', 
        'main.status.checking': 'Checking...',
        'main.status.unknown': 'Unknown',
        'main.status.vpn': 'VPN Server'
      }
    };
    
    this.init();
  }
    detectLanguage() {
    // Detecta idioma da URL, localStorage ou navegador
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const storedLang = localStorage.getItem('opserver-language');
    const browserLang = navigator.language.slice(0, 2);
    
    const detectedLang = urlLang || storedLang || (browserLang === 'pt' ? 'pt' : 'en');
    
    // Store the detected language
    if (detectedLang) {
      localStorage.setItem('opserver-language', detectedLang);
    }
    
    return detectedLang;
  }
  
  init() {
    this.updateLanguageSelector();
    this.translatePage();
    this.bindLanguageEvents();
  }
  
  translate(key) {
    return this.translations[this.currentLang][key] || key;
  }
  translatePage() {
    // Detecta a página atual e define o título apropriado
    const currentPage = window.location.pathname;
    let titleKey = 'page.title'; // Título padrão
    
    if (currentPage.includes('servers.html')) {
      titleKey = 'page.servers.title';
    }
    
    // Atualiza o título da página
    document.title = this.translate(titleKey);
    
    // Traduz elementos com atributo data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.translate(key);
      
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });
    
    // Traduz atributos específicos
    document.querySelectorAll('[data-translate-title]').forEach(element => {
      const key = element.getAttribute('data-translate-title');
      element.title = this.translate(key);
    });
    
    document.querySelectorAll('[data-translate-alt]').forEach(element => {
      const key = element.getAttribute('data-translate-alt');
      element.alt = this.translate(key);
    });
  }
  
  switchLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('opserver-language', lang);
      this.updateLanguageSelector();
      this.translatePage();
      
      // Atualiza URL sem recarregar a página
      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url);
    }
  }
  
  updateLanguageSelector() {
    document.querySelectorAll('[data-lang]').forEach(element => {
      const lang = element.getAttribute('data-lang');
      if (lang === this.currentLang) {
        element.classList.add('font-medium', 'text-white/80');
        element.classList.remove('text-white/50');
      } else {
        element.classList.remove('font-medium', 'text-white/80');
        element.classList.add('text-white/50');
      }
    });
  }
  
  bindLanguageEvents() {
    document.querySelectorAll('[data-lang]').forEach(element => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = element.getAttribute('data-lang');
        this.switchLanguage(lang);
      });
    });
  }
  
  getCurrentLanguage() {
    return this.currentLang;
  }
}

// Inicializa o sistema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  window.TranslationSystem = new TranslationSystem();
});

// Exporta para uso em outros arquivos (ES6 modules)
export default TranslationSystem;
