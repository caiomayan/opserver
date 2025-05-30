/**
 * Page Transition Handler
 * Provides smooth fade transitions between pages
 */

// Variable to store page state
var isPageLoaded = false;

// Function to handle page transitions
function handlePageTransitions() {
  // Add the opacity class to make the page visible
  if (document.body) {
    document.body.classList.add('transition-opacity', 'duration-300');
    
    // Make sure the page fades in properly
    setTimeout(function() {
      document.body.classList.add('opacity-100');
      isPageLoaded = true;
    }, 50);
  }
  
  // Get all links with data-transition attribute
  var links = document.querySelectorAll('[data-transition]');
  
  // Add click event listener to each link
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(event) {
      event.preventDefault();
      var href = this.getAttribute('href');
      
      // Store the page we are coming from in sessionStorage
      sessionStorage.setItem('lastPage', window.location.href);
      
      // Start fade out
      document.body.classList.remove('opacity-100');
      
      // Wait for animation to complete
      setTimeout(function() {
        window.location.href = href;
      }, 300);
    });
  }
}

// Handle browser back/forward navigation
window.addEventListener('pageshow', function(event) {
  // This is needed for back/forward navigation (including mouse back button)
  if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
    // If the page is being restored from cache (back button)
    if (!document.body.classList.contains('opacity-100')) {
      setTimeout(function() {
        document.body.classList.add('opacity-100');
      }, 50);
    }
  }
});

// Run when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handlePageTransitions);
} else {
  handlePageTransitions();
}
