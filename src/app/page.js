'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import Dashboard from '../components/Dashboard';
import LoadingScreen from '../components/LoadingScreen';
import { useTypingEffect } from '../hooks/useTypingEffect';

export default function Home() {
  const { user, loading } = useAuth();
  const [showAnimation, setShowAnimation] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { displayText, isTyping, isComplete, cursorVisible } = useTypingEffect('OPSERVER');

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    if (isComplete) {
      const fadeOutTimer = setTimeout(() => {
        setFadeOut(true);
        const hideTimer = setTimeout(() => {
          setShowAnimation(false);
          const showLoginTimer = setTimeout(() => {
            setShowLogin(true);
          }, 1000);
          return () => clearTimeout(showLoginTimer);
        }, 800);
        return () => clearTimeout(hideTimer);
      }, 800);
      return () => clearTimeout(fadeOutTimer);
    }
    return () => clearTimeout(logoTimer);
  }, [isComplete]);

  if (user) {
    return <Dashboard />;
  }
  if (loading && user !== null) {
    return <LoadingScreen message="Carregando..." />;
  }
  if (showAnimation) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col relative">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-5xl">
            <div className="mb-8">
              <div className={`transition-all duration-1000 ease-out ${showLogo && !fadeOut ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <img 
                  src="/logo.svg" 
                  alt="OPSERVER Logo" 
                  width="140" 
                  height="140" 
                  className="mx-auto"
                />
              </div>
            </div>
            <div className="mb-12">
              <div className={`transition-all duration-500 ease-out ${isTyping && !fadeOut ? 'opacity-100' : 'opacity-0'}`}>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 leading-none">
                  {displayText}
                  {cursorVisible && <span className="text-gray-400 animate-pulse ml-1">|</span>}
                </h1>
              </div>
            </div>
          </div>
        </div>
        <footer className="fixed bottom-0 left-0 right-0 py-2 flex justify-between items-center px-4">
          <div className="flex items-center gap-1.5">
            <img src="/logo.svg" alt="OPIUM Logo" width="16" height="16" />
            <span className="text-xs font-semibold text-gray-600">OPSERVER</span>
          </div>
          <p className="text-xs text-gray-400">Development</p>
          <div className="w-20"></div>
        </footer>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative">
      <footer className="fixed bottom-0 left-0 right-0 py-2 flex justify-between items-center px-4">
        <div className="flex items-center gap-1.5">
          <img src="/logo.svg" alt="OPIUM Logo" width="16" height="16" />
          <span className="text-xs font-semibold text-gray-600">OPSERVER</span>
        </div>
        <p className="text-xs text-gray-400">Development</p>
        <div className="w-20"></div>
      </footer>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`text-center transition-all duration-500 ease-out ${showLogin ? 'opacity-100' : 'opacity-0'}`}>
          {showLogin && (
            <>
              <div className="mb-8">
                <img 
                  src="/logo.svg" 
                  alt="Logo" 
                  className="w-16 h-16 mx-auto"
                />
              </div>
              {isSignUp ? (
                <SignUpForm onToggleMode={() => setIsSignUp(false)} />
              ) : (
                <LoginForm onToggleMode={() => setIsSignUp(true)} />
              )}
              <div className="mt-6">
                <button
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                  onClick={() => window.location.href = '/teams'}
                >
                  Não desejo fazer login
                </button>
                <p className="text-xs text-gray-400 mt-2">Você poderá apenas visualizar as configurações.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
