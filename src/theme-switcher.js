const createThemeButton = () => {
  const button = document.createElement('button');
  button.id = 'theme-toggle';
  button.innerHTML = '☀️';
  
  button.style.position = 'fixed';
  button.style.bottom = '24px';
  button.style.left = '24px';
  button.style.width = '40px';
  button.style.height = '40px';
  button.style.borderRadius = '8px';
  button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  button.style.background = 'rgba(17, 17, 17, 0.95)';
  button.style.backdropFilter = 'blur(12px)';
  button.style.webkitBackdropFilter = 'blur(12px)';
  button.style.color = '#ffffff';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9999';
  button.style.fontSize = '16px';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  button.style.outline = 'none';
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });
  
  return button;
};

const forceUpdateAllElements = (isLight) => {
  const primaryText = isLight ? '#000000' : '#ffffff';
  const secondaryText = isLight ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  const tertiaryText = isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
  const bgPrimary = isLight ? '#ffffff' : '#000000';
  const bgSecondary = isLight ? '#f9fafb' : '#0a0a0a';
  const navBg = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)';
  
  let themeStyle = document.getElementById('dynamic-theme-style');
  if (!themeStyle) {
    themeStyle = document.createElement('style');
    themeStyle.id = 'dynamic-theme-style';
    document.head.appendChild(themeStyle);
  }
  
  const themeColors = {
    primary: primaryText,
    secondary: secondaryText,
    tertiary: tertiaryText,
    bgPrimary,
    bgSecondary,
    navBg
  };
  
  const colorMappings = [
    { selector: 'body', props: ['background', 'color'], values: [bgPrimary, primaryText] },
    { selector: 'h1, h2, h3, h4, h5, h6', props: ['color'], values: [primaryText] },
    { selector: 'p, span, div:not(#theme-toggle), a, li, td, th, label, small, em, strong, b, i', props: ['color'], values: [secondaryText] }
  ];
  
  const generateCSSRules = (mappings) => {
    return mappings.map(({ selector, props, values }) => {
      const declarations = props.map((prop, index) => 
        `${prop}: ${values[index]} !important`
      ).join('; ');
      return `${selector} { ${declarations}; }`;
    }).join('\n    ');
  };
  
  const buttonColors = isLight 
    ? { bg: '#000000', color: '#ffffff' }
    : { bg: '#ffffff', color: '#000000' };
  
  const scrollbarColors = {
    track: bgSecondary,
    thumb: isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
    thumbHover: isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
  };
  
  const cssRules = `
    *, *::before, *::after {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, filter 0.3s ease !important;
    }
    
    ${generateCSSRules(colorMappings)}
    
    .text-white, .text-white\\/70, .text-white\\/60, .text-white\\/50, .text-white\\/80,
    .text-gray-100, .text-gray-200, .text-gray-300, .text-gray-400, .text-gray-500,
    .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400, .text-slate-500,
    [class*="text-white"], [class*="text-gray"], [class*="text-slate"] { 
      color: ${primaryText} !important; 
    }
    
    nav, nav *, .navbar, .navbar *, header, header * { 
      background: ${navBg} !important; 
      color: ${primaryText} !important; 
    }
    
    nav a, nav button, nav span, nav div, nav li,
    .navbar a, .navbar button, .navbar span, .navbar div, .navbar li { 
      color: ${primaryText} !important; 
    }
    
    #navbar-logo, #mobile-navbar-logo, .navbar-logo, nav img { 
      filter: ${isLight ? 'brightness(0) invert(1)' : 'brightness(0) invert(0)'} !important; 
    }
    
    #mobile-menu, #mobile-menu *, .mobile-nav, .mobile-nav * { 
      background: ${bgPrimary} !important; 
      color: ${primaryText} !important; 
    }
    
    .cta-button, #jogar-button { 
      background: ${buttonColors.bg} !important; 
      color: ${buttonColors.color} !important; 
    }
    
    .cta-button:hover, #jogar-button:hover { 
      background: ${isLight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'} !important; 
    }
    
    .glass-card, .feature-card, .opserver-card, .warning-card, .card, .container,
    [class*="card"], [class*="container"], [class*="panel"], [class*="box"] { 
      background: ${bgSecondary} !important; 
      border-color: ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'} !important; 
    }
    
    .glass-card *, .feature-card *, .opserver-card *, .warning-card *, .card *, .container *,
    [class*="card"] *, [class*="container"] *, [class*="panel"] *, [class*="box"] * { 
      color: ${primaryText} !important; 
    }
    
    footer, footer *, .footer, .footer * { 
      color: ${secondaryText} !important; 
      background: ${bgSecondary} !important; 
    }
    
    .server-name, .server-title, .server-header { 
      color: ${primaryText} !important; 
    }
    
    .detail-value, .value, .content-value { 
      color: ${primaryText} !important; 
    }
    
    .detail-label, .label, .content-label { 
      color: ${secondaryText} !important; 
    }
    
    .status-text, .status, .info { 
      color: ${secondaryText} !important; 
    }
    
    .player-count, .count, .metric { 
      color: ${primaryText} !important; 
      background: ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'} !important; 
    }
    
    .section-title, .title, .heading, .page-title { 
      color: ${primaryText} !important; 
    }
    
    .info-list li, .list-item, ul li, ol li { 
      color: ${secondaryText} !important; 
      border-color: ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'} !important; 
    }
    
    button:not(#theme-toggle):not(.cta-button):not(#jogar-button), .button, .btn { 
      background: ${buttonColors.bg} !important; 
      color: ${buttonColors.color} !important; 
    }
    
    .connect-btn, .primary-btn { 
      background: ${buttonColors.bg} !important; 
      color: ${buttonColors.color} !important; 
    }
    
    .action-button, .secondary-btn { 
      background: ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'} !important; 
      border-color: ${isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'} !important; 
      color: ${primaryText} !important; 
    }
    
    .status-badge, .badge, .tag { 
      background: ${isLight ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)'} !important; 
      color: ${primaryText} !important; 
    }
    
    .text, .text-content, .description, .subtitle { 
      color: ${secondaryText} !important; 
    }
    
    input, textarea, select { 
      background: ${bgSecondary} !important; 
      color: ${primaryText} !important; 
      border-color: ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'} !important; 
    }
    
    [class*="text-white"], [class*="text-light"], [class*="text-gray"] { 
      color: ${primaryText} !important; 
    }
    
    ::-webkit-scrollbar { 
      width: 8px; 
    }
    
    ::-webkit-scrollbar-track { 
      background: ${scrollbarColors.track}; 
    }
    
    ::-webkit-scrollbar-thumb { 
      background: ${scrollbarColors.thumb}; 
      border-radius: 4px; 
    }
    
    ::-webkit-scrollbar-thumb:hover { 
      background: ${scrollbarColors.thumbHover}; 
    }
  `;
  
  themeStyle.textContent = cssRules;
  
  const criticalElements = [
    { id: 'jogar-button', styles: { background: buttonColors.bg, color: buttonColors.color } },
    { id: 'navbar-logo', styles: { filter: isLight ? 'brightness(0) invert(1)' : 'brightness(0) invert(0)' } },
    { id: 'mobile-navbar-logo', styles: { filter: isLight ? 'brightness(0) invert(1)' : 'brightness(0) invert(0)' } },
    { id: 'main-navbar', styles: { background: navBg } }
  ];
  
  document.body.style.setProperty('background', bgPrimary, 'important');
  document.body.style.setProperty('color', primaryText, 'important');
  
  criticalElements
    .map(({ id, styles }) => ({ element: document.getElementById(id), styles }))
    .filter(({ element }) => element !== null)
    .forEach(({ element, styles }) => {
      Object.entries(styles).forEach(([prop, value]) => {
        element.style.setProperty(prop, value, 'important');
      });
    });
};

const toggleTheme = () => {
  const currentTheme = localStorage.getItem('opserver-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('opserver-theme', newTheme);
  
  const isLight = newTheme === 'light';
  const button = document.getElementById('theme-toggle');
  
  if (button) {
    if (isLight) {
      button.innerHTML = '🌙';
      button.style.background = 'rgba(248, 250, 252, 0.95)';
      button.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      button.style.color = '#1f2937';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
      button.innerHTML = '☀️';
      button.style.background = 'rgba(17, 17, 17, 0.95)';
      button.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      button.style.color = '#ffffff';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }
  }
  
  forceUpdateAllElements(isLight);
};

const initTheme = () => {
  const button = createThemeButton();
  document.body.appendChild(button);
  
  button.addEventListener('click', toggleTheme);
  
  const savedTheme = localStorage.getItem('opserver-theme') || 'dark';
  const isLight = savedTheme === 'light';
  
  if (isLight) {
    button.innerHTML = '🌙';
    button.style.background = 'rgba(248, 250, 252, 0.95)';
    button.style.borderColor = 'rgba(0, 0, 0, 0.1)';
    button.style.color = '#1f2937';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    forceUpdateAllElements(true);
  }
  
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldUpdate = true;
      }
    });
    
    if (shouldUpdate) {
      setTimeout(() => {
        const currentTheme = localStorage.getItem('opserver-theme') || 'dark';
        forceUpdateAllElements(currentTheme === 'light');
      }, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}