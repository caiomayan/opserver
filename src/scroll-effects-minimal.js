const createCursor = () => {
  const cursor = document.createElement('span');
  cursor.style.cssText = `
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    margin-left: 4px;
    vertical-align: middle;
    transform: translateY(-1px);
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
      
      setTimeout(addChar, 60);
    } else {
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    }
  };
  
  addChar();
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-typewriter]').forEach(element => {
    const text = element.textContent.trim();
    
    setTimeout(() => {
      typewriterEffect(element, text);
    }, element.dataset.typewriter === 'title' ? 0 : 400);
  });
});

export { typewriterEffect, createCursor };
