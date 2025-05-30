function handlePageTransitions() {
  if (document.body) {
    document.body.classList.add('transition-opacity', 'duration-300');
    
    // Make sure the page fades in properly
    setTimeout(function() {
      document.body.classList.add('opacity-100');
      isPageLoaded = true;
    }, 50);
  }
  
  var links = document.querySelectorAll('[data-transition]');
  
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(event) {
      event.preventDefault();
      var href = this.getAttribute('href');
      

      sessionStorage.setItem('lastPage', window.location.href);
      
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
