'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const redirectToMain = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsVisible(false);
    
    setTimeout(() => {
      router.push('/main');
    }, 400);
  };

  return (
    <div 
      className={`bg-white font-['Inter'] antialiased h-screen overflow-hidden transition-opacity duration-300 flex flex-col ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div 
            className="block"
            onClick={redirectToMain}
            style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
          >
            <Image
              src="/img/transparentlogo.png"
              alt="OpServer Logo"
              width={256}
              height={256}
              quality={100}
              className="w-64 md:w-80 transition-all duration-700 ease-out hover:scale-110 opacity-90 hover:opacity-100 animate-fadeIn cursor-pointer"
              priority
            />
          </div>
        </div>
      </div>

      <footer className="py-3 px-6">
        <div className="w-full">
          <div className="flex justify-between items-center">
            <div className="absolute left-1/2 transform -translate-x-1/2 text-[11px] text-black/50">
              By using OPSERVER you agree to our practices
            </div>
            
            <div className="ml-auto font-display text-sm font-medium tracking-tight text-black/80">
              OPSERVER
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
