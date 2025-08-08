'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [displayText, setDisplayText] = useState('');
  const [showNavigation, setShowNavigation] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const fullText = 'OPSERVER';

  useEffect(() => {
    // First show logo
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    
    // Then start typing
    const typingTimer = setTimeout(() => {
      setShowTyping(true);
      setCursorVisible(true);
    }, 800);

    let index = 0;
    const typeText = () => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
        setTimeout(typeText, 60);
      } else {
        // Simple cursor behavior
        setTimeout(() => {
          setCursorVisible(false);
          setTimeout(() => setShowNavigation(true), 300);
        }, 400);
      }
    };
    
    const startTyping = setTimeout(typeText, 1200);
    
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(typingTimer);
      clearTimeout(startTyping);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-5xl">
          {/* Logo with fade-in effect */}
          <div className="mb-8">
            <div className={`transition-all duration-1000 ease-out ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <img 
                src="/logo.svg" 
                alt="OPSERVER Logo" 
                width="140" 
                height="140" 
                className="mx-auto"
              />
            </div>
          </div>
          
          {/* Simple typing effect */}
          <div className="mb-12">
            <div className={`transition-all duration-500 ease-out ${showTyping ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 leading-none">
                {displayText}
                {cursorVisible && <span className="text-gray-400 animate-pulse ml-1">|</span>}
              </h1>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className={`transition-all duration-600 ease-out ${showNavigation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {/* Teams */}
              <Link 
                href="/teams" 
                className="group relative bg-white p-6 rounded-lg transition-all duration-200 border border-gray-200/60 hover:border-gray-300/80 hover:bg-gray-50/30"
              >
                <div className="text-center">
                  <div className="text-2xl mb-3 text-gray-700 group-hover:text-gray-900 transition-colors duration-200">🏆</div>
                  <h2 className="text-base font-medium text-gray-900 mb-1">Teams</h2>
                  <p className="text-gray-500 text-sm font-normal">Professional teams</p>
                </div>
                {/* Subtle bottom border accent */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>

              {/* Server */}
              <Link 
                href="/server" 
                className="group relative bg-white p-6 rounded-lg transition-all duration-200 border border-gray-200/60 hover:border-gray-300/80 hover:bg-gray-50/30"
              >
                <div className="text-center">
                  <div className="text-2xl mb-3 text-gray-700 group-hover:text-gray-900 transition-colors duration-200">🎮</div>
                  <h2 className="text-base font-medium text-gray-900 mb-1">Server</h2>
                  <p className="text-gray-500 text-sm font-normal">CS2 Retake Server</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>

              {/* Stats */}
              <Link 
                href="/stats" 
                className="group relative bg-white p-6 rounded-lg transition-all duration-200 border border-gray-200/60 hover:border-gray-300/80 hover:bg-gray-50/30"
              >
                <div className="text-center">
                  <div className="text-2xl mb-3 text-gray-700 group-hover:text-gray-900 transition-colors duration-200">📊</div>
                  <h2 className="text-base font-medium text-gray-900 mb-1">Stats</h2>
                  <p className="text-gray-500 text-sm font-normal">Rankings and statistics</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>

              {/* Admin */}
              <Link 
                href="/admin" 
                className="group relative bg-white p-6 rounded-lg transition-all duration-200 border border-gray-200/60 hover:border-gray-300/80 hover:bg-gray-50/30"
              >
                <div className="text-center">
                  <div className="text-2xl mb-3 text-gray-700 group-hover:text-gray-900 transition-colors duration-200">⚙️</div>
                  <h2 className="text-base font-medium text-gray-900 mb-1">Admin</h2>
                  <p className="text-gray-500 text-sm font-normal">Management panel</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 text-center py-2">
        <p className="text-xs text-gray-400">Development</p>
      </footer>
    </div>
  )
}
