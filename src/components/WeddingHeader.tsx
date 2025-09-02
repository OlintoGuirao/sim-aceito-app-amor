import React from 'react';

const WeddingHeader: React.FC = () => {
  return (
    <div className="text-center mb-4">
      <div className="inline-flex items-center justify-center w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/90 ring-6 ring-wedding-marsala shadow-2xl ring-offset-2 ring-offset-white mb-6 animate-float overflow-hidden p-4">
        <img src="/MonogramaFJ.png" alt="Monograma FJ" className="w-44 h-44 md:w-52 md:h-52 object-contain drop-shadow-2xl" />
      </div>
      
      <h1 className="font-['Dancing_Script'] text-6xl md:text-7xl mb-4 animate-fade-in text-black">
        Sim, Aceito!
      </h1>
      
      <div className="space-y-2 animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
        <h2 className="font-elegant text-2xl text-white md:text-3xl">FabÍola & Juninho</h2>
        <p className="text-lg text-white">
          25 de Abril de 2026
        </p>
        
      </div>
      
      
    </div>
  );
};

export default WeddingHeader;