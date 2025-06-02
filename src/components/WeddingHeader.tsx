import React from 'react';

const WeddingHeader: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-wedding-marsala/20 mb-6 animate-float">
        <span className="text-4xl">💍</span>
      </div>
      
      <h1 className="font-['Dancing_Script'] text-6xl md:text-7xl mb-4 animate-fade-in text-black">
        Sim, Aceito!
      </h1>
      
      <div className="space-y-2 animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
        <h2 className="font-elegant text-2xl text-white md:text-3xl">Fabiola &amp; Xuniim</h2>
        <p className="text-lg text-muted-foreground">
          25 de Abril de 2026
        </p>
        <p className="text-base text-muted-foreground">
          Não definido • Não definido
        </p>
      </div>
      
      <div className="flex justify-center space-x-8 mt-6">
        <div className="w-2 h-2 bg-wedding-marsala rounded-full animate-sparkle"></div>
        <div className="w-2 h-2 bg-wedding-palha rounded-full animate-sparkle" style={{
          animationDelay: '0.5s'
        }}></div>
        <div className="w-2 h-2 bg-wedding-accent rounded-full animate-sparkle" style={{
          animationDelay: '1s'
        }}></div>
      </div>
    </div>
  );
};

export default WeddingHeader;