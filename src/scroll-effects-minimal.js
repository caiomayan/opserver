// Exact Blackbox.ai typewriter effect
const createCursor = () => {
  const cursor = document.createElement('span');
  // Styled span for a non-blinking dot cursor
  cursor.style.cssText = `
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    margin-left: 4px;
    vertical-align: middle;
    transform: translateY(-1px); /* Fine-tune vertical alignment */
  `;
  return cursor;
};

const typewriterEffect = (element, text) => {
  element.innerHTML = '';
  const cursor = createCursor();
  element.appendChild(cursor);
  
  let charIndex = 0;
  
  const addChar = () => {
    if (charIndex < text.length) {
      const char = text.charAt(charIndex);
      const textNode = document.createTextNode(char);
      element.insertBefore(textNode, cursor);
      charIndex++;
      
      // Faster, more natural typing speed
      setTimeout(addChar, 60);
    } else {
      // Remove cursor immediately after completion
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    }
  };
  
  // Start immediately
  addChar();
};

// Initialize the effect
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-typewriter]').forEach(element => {
    const text = element.textContent.trim();
    
    setTimeout(() => {
      typewriterEffect(element, text);
    }, element.dataset.typewriter === 'title' ? 0 : 400);
  });
});

export { typewriterEffect, createCursor };
