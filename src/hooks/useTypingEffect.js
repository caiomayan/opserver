import { useState, useEffect } from 'react';

export const useTypingEffect = (text, typingSpeed = 60, startDelay = 1200) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);

  useEffect(() => {
    let index = 0;
    const startTyping = setTimeout(() => {
      setIsTyping(true);
      setCursorVisible(true);
      const typeText = () => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
          setTimeout(typeText, typingSpeed);
        } else {
          setTimeout(() => {
            setCursorVisible(false);
            setIsComplete(true);
          }, 400);
        }
      };
      typeText();
    }, startDelay);
    return () => {
      clearTimeout(startTyping);
    };
  }, [text, typingSpeed, startDelay]);

  return {
    displayText,
    isTyping,
    isComplete,
    cursorVisible
  };
};
