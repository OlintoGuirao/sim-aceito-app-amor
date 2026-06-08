import React from 'react';

const WeddingHeader: React.FC = () => {
  return (
    <div className="text-center mb-4 px-1">
      <div className="inline-flex items-center justify-center w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full bg-white/90 ring-4 sm:ring-6 ring-wedding-marsala shadow-2xl ring-offset-2 ring-offset-white mb-4 sm:mb-6 animate-float overflow-hidden">
        <img src="/logo1.png" alt="Logo Bruno & Guilherme" className="w-full h-full object-cover" />
      </div>
      
      <h1 className="font-['Dancing_Script'] text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 animate-fade-in text-black leading-tight">
        Sim, Aceito!
      </h1>
      
      <div className="space-y-1.5 sm:space-y-2 animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
        <h2 className="font-elegant text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] tracking-wide">
          Bruno & Guilherme
        </h2>
        <p className="text-base sm:text-lg text-white">
          22 de Agosto de 2026 às 18:30
        </p>
        
      </div>
      
      
    </div>
  );
};

export default WeddingHeader;