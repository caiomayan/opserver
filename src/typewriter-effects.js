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
  const typewriterElements = Array.from(document.querySelectorAll('[data-typewriter]'));
  
  const titleElements = typewriterElements.filter(element => 
    element.dataset.typewriter === 'title'
  );
  
  const subtitleElements = typewriterElements.filter(element => 
    element.dataset.typewriter === 'subtitle'
  );
  
  const elementsWithText = typewriterElements.map(element => ({
    element,
    text: element.textContent.trim(),
    delay: element.dataset.typewriter === 'title' ? 0 : 400
  }));
  
  const totalCharacters = elementsWithText.reduce((total, item) => 
    total + item.text.length, 0
  );
  
  elementsWithText.forEach(({ element, text, delay }) => {
    setTimeout(() => {
      typewriterEffect(element, text);
    }, delay);
  });
});

export { typewriterEffect, createCursor };
