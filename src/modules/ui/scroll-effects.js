/**
 * OpServer Scroll Effects System - Parallax Real
 * Efeito parallax verdadeiro nas seções
 */

class ScrollEffects {
  constructor() {
    this.scrollProgress = null;
    this.observerOptions = {
      threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
      rootMargin: '-50px 0px -50px 0px'
    };
    
    this.init();
  }

  init() {
    this.createScrollProgress();
    this.setupIntersectionObserver();
    this.setupParallaxEffects();
    this.setupSmoothScroll();
    this.bindScrollEvents();
    this.initTypewriterEffects();
  }

  // 1. Barra de Progresso de Scroll
  createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = `<div class="progress-fill"></div>`;
    document.body.prepend(progressBar);
    this.scrollProgress = progressBar.querySelector('.progress-fill');
  }

  // 2. Observer para elementos que entram na tela
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          if (entry.target.dataset.revealText) {
            this.revealText(entry.target);
          }
          
          if (entry.target.dataset.countTo) {
            this.animateCounter(entry.target);
          }
        }
      });
    }, this.observerOptions);

    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .rotate-in').forEach(el => {
      observer.observe(el);
    });
  }

  // 3. Efeitos Parallax - VERDADEIRO efeito parallax
  setupParallaxEffects() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      this.updateParallaxSections(scrolled);
    });
  }
  updateParallaxSections(scrolled) {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Só aplicar parallax quando o elemento está na viewport
      if (rect.bottom >= 0 && rect.top <= windowHeight) {        const speed = parseFloat(element.dataset.speed) || 0.08;
        
        // Calcular offset mais perceptível, mas ainda controlado
        const elementTop = element.offsetTop;
        const windowCenter = scrolled + (windowHeight / 2);
        const elementCenter = elementTop + (element.offsetHeight / 2);
        
        // Distância um pouco maior para ser mais perceptível
        const distance = (windowCenter - elementCenter) * 0.3; // Aumentado de 0.1 para 0.3
        
        // Aplicar efeito parallax mais visível
        const parallaxOffset = distance * speed;
        
        // Aumentar limite máximo para movimento mais visível
        const maxOffset = 50; // Aumentado de 20px para 50px
        const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, parallaxOffset));
        
        element.style.transform = `translateY(${limitedOffset}px)`;          // Efeito especial para o hero (mais perceptível)
        if (element.id === 'top') {
          // Fade out mais perceptível do hero conforme rola
          const fadeProgress = Math.max(0.5, 1 - (scrolled / windowHeight));
          element.style.opacity = fadeProgress;
        }
      }
    });
  }

  // 4. Scroll suave customizado
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        
        if (target) {
          this.smoothScrollTo(target);
        }
      });
    });
  }

  smoothScrollTo(target) {
    const targetPosition = target.offsetTop - 100;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    const ease = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = ease(progress);
      
      window.scrollTo(0, startPosition + (distance * easedProgress));
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  // 5. Eventos de scroll
  bindScrollEvents() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollProgress();
          this.updateNavbar();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  updateScrollProgress() {
    const scrolled = window.pageYOffset;
    const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrolled / maxHeight) * 100;
    
    if (this.scrollProgress) {
      this.scrollProgress.style.width = `${progress}%`;
    }
  }

  updateNavbar() {
    const navbar = document.querySelector('nav');
    const scrolled = window.pageYOffset;
    
    if (navbar) {
      if (scrolled > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  // 6. Animação de texto letra por letra
  revealText(element) {
    const text = element.textContent;
    element.innerHTML = '';
    
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.className = 'char';
      span.style.cssText = `
        opacity: 0;
        transform: translateY(30px) rotateX(90deg);
        transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        transition-delay: ${i * 0.05}s;
        display: inline-block;
        transform-origin: center bottom;
      `;
      element.appendChild(span);
      
      setTimeout(() => {
        span.style.opacity = '1';
        span.style.transform = 'translateY(0) rotateX(0deg)';
      }, 100 + (i * 50));
    });
  }

  // 7. Efeito de digitação (typewriter)
  typewriterEffect(element, text, speed = 100) {
    element.innerHTML = '';
    let index = 0;
    
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    element.appendChild(cursor);
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        const char = text[index];
        const span = document.createElement('span');
        span.textContent = char;
        span.style.opacity = '0';
        span.style.animation = 'typeChar 0.1s ease-out forwards';
        
        element.insertBefore(span, cursor);
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          if (cursor.parentNode) {
            cursor.remove();
          }
        }, 2000);
      }
    }, speed);
  }

  // 8. Inicializar efeitos de digitação no hero
  initTypewriterEffects() {
    setTimeout(() => {
      const heroTitle = document.querySelector('[data-typewriter="title"]');
      const heroSubtitle = document.querySelector('[data-typewriter="subtitle"]');
      
      let titleText = '';
      
      if (heroTitle) {
        titleText = heroTitle.textContent.trim() || 'OPSERVER';
        this.typewriterEffect(heroTitle, titleText, 120);
      }
      
      if (heroSubtitle) {
        const subtitleText = heroSubtitle.textContent.trim() || 'Um Grande Caos';
        setTimeout(() => {
          this.typewriterEffect(heroSubtitle, subtitleText, 80);
        }, titleText ? titleText.length * 150 + 500 : 1000);
      }
    }, 200);
  }

  // 9. Contador animado
  animateCounter(element) {
    const target = parseInt(element.dataset.countTo);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      element.textContent = Math.floor(current);
      
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      }
    }, 16);
  }
}

// CSS para os efeitos
const scrollEffectsCSS = `
  /* Barra de Progresso */
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 10000;
  }
  
  .progress-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #ffffff, #666666);
    transition: width 0.1s ease;
  }
  /* Animações de Entrada - Sutis e Profissionais */
  .fade-in {
    opacity: 0;
    transform: translateY(15px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-in.in-view {
    opacity: 1;
    transform: translateY(0);
  }

  .slide-in-left {
    opacity: 0;
    transform: translateX(-30px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .slide-in-left.in-view {
    opacity: 1;
    transform: translateX(0);
  }

  .slide-in-right {
    opacity: 0;
    transform: translateX(30px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .slide-in-right.in-view {
    opacity: 1;
    transform: translateX(0);
  }

  .scale-in {
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .scale-in.in-view {
    opacity: 1;
    transform: scale(1);
  }

  .rotate-in {
    opacity: 0;
    transform: rotate(-3deg) scale(0.98);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .rotate-in.in-view {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }

  /* Navbar com scroll */
  nav.scrolled {
    backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.95);
    box-shadow: 0 2px 30px rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Parallax - Efeito suave */
  .parallax {
    will-change: transform;
    transition: transform 0.1s ease-out;
  }

  /* Efeitos de hover melhorados */
  .enhanced-hover {
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
  }

  .enhanced-hover::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
  }

  .enhanced-hover:hover::before {
    left: 100%;
  }

  .enhanced-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  /* Efeito de digitação */
  .typewriter-cursor {
    animation: blink 1s infinite;
    color: white;
    font-weight: normal;
    margin-left: 2px;
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  
  @keyframes typeChar {
    from { 
      opacity: 0; 
      transform: translateY(10px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  /* Scroll suave para toda a página */
  html {
    scroll-behavior: smooth;
  }

  /* Esconder elementos inicialmente */
  .fade-in, .slide-in-left, .slide-in-right, .scale-in, .rotate-in {
    opacity: 0;
  }
`;

// Adicionar CSS ao documento
const style = document.createElement('style');
style.textContent = scrollEffectsCSS;
document.head.appendChild(style);

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  window.scrollEffects = new ScrollEffects();
});

export default ScrollEffects;
