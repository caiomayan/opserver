// Functional programming approach for scroll effects
const setStyles = (element, styles) => Object.assign(element.style, styles);

const animateElement = (element) => {
  setStyles(element, {
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
  });
  
  setTimeout(() => setStyles(element, {
    opacity: '1',
    transform: 'translateY(0)'
  }), 300);
};

const createTypewriter = (element, text, speed = 50) => {
  element.textContent = '';
  let i = 0;
  
  const typeWriter = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i++);
      setTimeout(typeWriter, speed);
    }
  };
  
  return typeWriter;
};

const initializeTypewriter = (element) => {
  const text = element.textContent.trim();
  animateElement(element);
  
  const typeWriter = createTypewriter(element, text);
  setTimeout(typeWriter, 800);
};

// Initialize effects using functional approach
document.addEventListener('DOMContentLoaded', () => {
  const typewriterElements = Array.from(document.querySelectorAll('[data-typewriter]'));
  typewriterElements.forEach(initializeTypewriter);
});

// Export utilities for reuse
export { setStyles, animateElement, createTypewriter, initializeTypewriter };
