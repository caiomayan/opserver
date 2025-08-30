import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const usePageNavigation = () => {
  const router = useRouter();
  const goTo = (path) => router.push(path);
  return goTo;
};

// Hook para elementos internos que também precisam de transições
export const useElementTransition = () => {
  const [isVisible, setIsVisible] = useState(false);
  const fadeIn = () => setIsVisible(true);
  const fadeOut = () => setIsVisible(false);
  return {
    isVisible,
    fadeIn,
    fadeOut
  };
};
