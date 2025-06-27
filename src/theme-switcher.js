// Enhanced Theme Switcher - Forces ALL elements to change
console.log('🔧 Enhanced theme switcher loading...');

const createThemeButton = () => {
  console.log('🔧 Creating theme button...');
  const button = document.createElement('button');
  button.id = 'theme-toggle';
  button.innerHTML = '☀️';
  
  // Precise Blackbox.ai-inspired styling
  button.style.position = 'fixed';
  button.style.bottom = '24px';
  button.style.left = '24px';
  button.style.width = '40px';
  button.style.height = '40px';
  button.style.borderRadius = '8px'; // Slightly rounded corners like Blackbox
  button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  button.style.background = 'rgba(17, 17, 17, 0.95)'; // Darker, more professional
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
  
  // Hover effect
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });
  
  console.log('🔧 Button created with Blackbox.ai styling');
  return button;
};

const forceUpdateAllElements = (isLight) => {
  console.log('🎨 Force updating all elements, isLight:', isLight);
  
  const primaryText = isLight ? '#000000' : '#ffffff';
  const secondaryText = isLight ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  const tertiaryText = isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
  const bgPrimary = isLight ? '#ffffff' : '#000000';
  const bgSecondary = isLight ? '#f9fafb' : '#0a0a0a';
  const navBg = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)';
  
  // Add or update theme CSS
  let themeStyle = document.getElementById('dynamic-theme-style');
  if (!themeStyle) {
    themeStyle = document.createElement('style');
    themeStyle.id = 'dynamic-theme-style';
    document.head.appendChild(themeStyle);
  }
  
  // Create comprehensive CSS rules
  const cssRules = `
    /* Global transitions for smooth theme switching */
    *, *::before, *::after {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, filter 0.3s ease !important;
    }
    
    /* Force theme colors on everything - Enhanced Coverage */
    body { 
      background: ${bgPrimary} !important; 
      color: ${primaryText} !important; 
    }
    
    /* All text elements - Primary headings */
    h1, h2, h3, h4, h5, h6 { 
      color: ${primaryText} !important; 
    }
    
    /* All text elements - Secondary text */
    p, span, div:not(#theme-toggle), a, li, td, th, label, small, em, strong, b, i { 
      color: ${secondaryText} !important; 
    }
    
    /* Tailwind text classes override - All variants */
    .text-white, .text-white\\/70, .text-white\\/60, .text-white\\/50, .text-white\\/80,
    .text-gray-100, .text-gray-200, .text-gray-300, .text-gray-400, .text-gray-500,
    .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400, .text-slate-500,
    [class*="text-white"], [class*="text-gray"], [class*="text-slate"] { 
      color: ${primaryText} !important; 
    }
    
    /* Navigation - Enhanced */
    nav, nav *, .navbar, .navbar *, header, header * { 
      background: ${navBg} !important; 
      color: ${primaryText} !important; 
    }
    
    nav a, nav button, nav span, nav div, nav li,
    .navbar a, .navbar button, .navbar span, .navbar div, .navbar li { 
      color: ${primaryText} !important; 
    }
    
    /* Logo filter for proper theme switching */
    #navbar-logo, #mobile-navbar-logo, .navbar-logo, nav img { 
      filter: ${isLight ? 'brightness(0) invert(1)' : 'brightness(0) invert(0)'} !important; 
    }
    
    /* Mobile menu - Enhanced */
    #mobile-menu, #mobile-menu *, .mobile-nav, .mobile-nav * { 
      background: ${bgPrimary} !important; 
      color: ${primaryText} !important; 
    }
    
    /* CTA Button - Special handling for JOGAR button */
    .cta-button, #jogar-button { 
      background: ${isLight ? '#000000' : '#ffffff'} !important; 
      color: ${isLight ? '#ffffff' : '#000000'} !important; 
    }
    
    .cta-button:hover, #jogar-button:hover { 
      background: ${isLight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'} !important; 
    }
    
    /* Cards and containers - All variants */
    .glass-card, .feature-card, .opserver-card, .warning-card, .card, .container,
    [class*="card"], [class*="container"], [class*="panel"], [class*="box"] { 
      background: ${bgSecondary} !important; 
      border-color: ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'} !important; 
    }
    
    .glass-card *, .feature-card *, .opserver-card *, .warning-card *, .card *, .container *,
    [class*="card"] *, [class*="container"] *, [class*="panel"] *, [class*="box"] * { 
      color: ${primaryText} !important; 
    }
    
    /* Footer - Enhanced */
    footer, footer *, .footer, .footer * { 
      color: ${secondaryText} !important; 
      background: ${bgSecondary} !important; 
    }
    
    /* Server card specific - Enhanced */
    .server-name, .server-title, .server-header { 
      color: ${primaryText} !important; 
    }
    
    .detail-value, .value, .content-value { 
      color: ${primaryText} !important; 
    }
    
    .detail-label, .label, .content-label { 
      color: ${secondaryText} !important; 
    }
    
    /* Status elements - Enhanced */
    .status-text, .status, .info { 
      color: ${secondaryText} !important; 
    }
    
    .player-count, .count, .metric { 
      color: ${primaryText} !important; 
      background: ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'} !important; 
    }
    
    /* Section headers and titles - Enhanced */
    .section-title, .title, .heading, .page-title { 
      color: ${primaryText} !important; 
    }
    
    /* Info lists - Enhanced */
    .info-list li, .list-item, ul li, ol li { 
      color: ${secondaryText} !important; 
      border-color: ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'} !important; 
    }
    
    /* Preserve button colors (except theme toggle) - Enhanced */
    button:not(#theme-toggle):not(.cta-button):not(#jogar-button), .button, .btn { 
      background: ${isLight ? '#000000' : '#ffffff'} !important; 
      color: ${isLight ? '#ffffff' : '#000000'} !important; 
    }
    
    .connect-btn, .primary-btn { 
      background: ${isLight ? '#000000' : '#ffffff'} !important; 
      color: ${isLight ? '#ffffff' : '#000000'} !important; 
    }
    
    /* Action buttons - Enhanced */
    .action-button, .secondary-btn { 
      background: ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'} !important; 
      border-color: ${isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'} !important; 
      color: ${primaryText} !important; 
    }
    
    /* Status badges - Enhanced */
    .status-badge, .badge, .tag { 
      background: ${isLight ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)'} !important; 
      color: ${primaryText} !important; 
    }
    
    /* Typography elements */
    .text, .text-content, .description, .subtitle { 
      color: ${secondaryText} !important; 
    }
    
    /* Inputs and forms */
    input, textarea, select { 
      background: ${bgSecondary} !important; 
      color: ${primaryText} !important; 
      border-color: ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'} !important; 
    }
    
    /* Override any remaining white/light text */
    [class*="text-white"], [class*="text-light"], [class*="text-gray"] { 
      color: ${primaryText} !important; 
    }
    
    /* Scrollbar styling */
    ::-webkit-scrollbar { 
      width: 8px; 
    }
    
    ::-webkit-scrollbar-track { 
      background: ${bgSecondary}; 
    }
    
    ::-webkit-scrollbar-thumb { 
      background: ${isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}; 
      border-radius: 4px; 
    }
    
    ::-webkit-scrollbar-thumb:hover { 
      background: ${isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'}; 
    }
  `;
  
  themeStyle.textContent = cssRules;
  
  // Immediate synchronous updates for critical elements
  document.body.style.setProperty('background', bgPrimary, 'important');
  document.body.style.setProperty('color', primaryText, 'important');
  
  // Update specific elements immediately
  const jogarButton = document.getElementById('jogar-button');
  if (jogarButton) {
    jogarButton.style.setProperty('background', isLight ? '#000000' : '#ffffff', 'important');
    jogarButton.style.setProperty('color', isLight ? '#ffffff' : '#000000', 'important');
  }
  
  const navbarLogo = document.getElementById('navbar-logo');
  if (navbarLogo) {
    navbarLogo.style.setProperty('filter', isLight ? 'brightness(0) invert(1)' : 'brightness(0) invert(0)', 'important');
  }
  
  const mobileNavbarLogo = document.getElementById('mobile-navbar-logo');
  if (mobileNavbarLogo) {
    mobileNavbarLogo.style.setProperty('filter', isLight ? 'brightness(0) invert(1)' : 'brightness(0) invert(0)', 'important');
  }
  
  const navbar = document.getElementById('main-navbar');
  if (navbar) {
    navbar.style.setProperty('background', navBg, 'important');
  }
  
  console.log('✅ CSS theme rules applied and critical elements updated immediately');
};

const toggleTheme = () => {
  console.log('🎨 Toggling theme...');
  const currentTheme = localStorage.getItem('opserver-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('opserver-theme', newTheme);
  
  const isLight = newTheme === 'light';
  const button = document.getElementById('theme-toggle');
  
  // Update button
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
  
  // Force update all elements
  forceUpdateAllElements(isLight);
  
  console.log('🎨 Theme switched to:', newTheme);
};

const initTheme = () => {
  console.log('🔧 Initializing enhanced theme system...');
  
  // Create button
  const button = createThemeButton();
  document.body.appendChild(button);
  console.log('🔧 Button added to DOM');
  
  // Add click event
  button.addEventListener('click', toggleTheme);
  console.log('🔧 Click event added');
  
  // Apply saved theme
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
  
  // Monitor for dynamic content changes
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
  
  console.log('✅ Enhanced theme system initialized:', savedTheme);
  console.log('✅ Dynamic content monitoring enabled');
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

console.log('🔧 Enhanced theme switcher script loaded');