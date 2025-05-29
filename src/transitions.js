/**
 * Page Transition Handler
 * Provides smooth fade transitions between pages
 */

// Function to handle page transitions
function handlePageTransitions() {
  // Add the opacity class to make the page visible
  if (document.body) {
    document.body.classList.add('transition-opacity', 'duration-300');
    
    setTimeout(function() {
      document.body.classList.add('opacity-100');
    }, 50);
  }
  
  // Get all links with data-transition attribute
  var links = document.querySelectorAll('[data-transition]');
  
  // Add click event listener to each link
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(event) {
      event.preventDefault();
      var href = this.getAttribute('href');
      
      // Start fade out
      document.body.classList.remove('opacity-100');
      
      // Wait for animation to complete
      setTimeout(function() {
        window.location.href = href;
      }, 300);
    });
  }
}

// Run when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handlePageTransitions);
} else {
  handlePageTransitions();
}
