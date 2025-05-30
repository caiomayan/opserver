function handlePageTransitions() {
  if (document.body) {
    document.body.classList.add('transition-opacity', 'duration-300');
    
    setTimeout(function() {
      document.body.classList.add('opacity-100');
    }, 50);
  }
  
  var links = document.querySelectorAll('[data-transition]');
  
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(event) {
      event.preventDefault();
      var href = this.getAttribute('href');
      
      document.body.classList.remove('opacity-100');
      
      setTimeout(function() {
        window.location.href = href;
      }, 300);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handlePageTransitions);
} else {
  handlePageTransitions();
}
