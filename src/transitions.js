function handlePageTransitions() {
  if (document.body) {
    document.body.classList.add('transition-opacity', 'duration-300');
    
    // Make sure the page fades in properly
    setTimeout(function() {
      document.body.classList.add('opacity-100');
    }, 50);
  }
  
  var links = document.querySelectorAll('[data-transition]');
  
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(event) {
      event.preventDefault();
      var href = this.getAttribute('href');
      
      // Se o href for # ou #alguma-coisa, apenas animar sem navegar
      if (href.startsWith('#')) {
        // Criar um efeito de clique sem navegação
        document.body.classList.remove('opacity-100');
        
        setTimeout(function() {
          document.body.classList.add('opacity-100');
        }, 300);
        return;
      }
      
      // Para links normais em ambiente de produção
      if (window.location.pathname.includes('/dist/') || 
          document.querySelector('script[crossorigin]')) {
        window.open(href, '_blank');
        return;
      }
      
      // Caso contrário, usar a transição normal
      document.body.classList.remove('opacity-100');
      
      setTimeout(function() {
        window.location.href = href;
      }, 300);
    });
  }
}


window.addEventListener('pageshow', function(event) {

  if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
 
    if (!document.body.classList.contains('opacity-100')) {
      setTimeout(function() {
        document.body.classList.add('opacity-100');
      }, 50);
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handlePageTransitions);
} else {
  handlePageTransitions();
}
