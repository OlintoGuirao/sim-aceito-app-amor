import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

const ABOVE_THE_FOLD_COUNT = 5;

const PhotoGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set());
  const photos = [
    { id: 1, src: '/NossaHistoria (1).jpeg' },
    { id: 2, src: '/NossaHistoria (2).jpeg' },
    { id: 3, src: '/NossaHistoria (3).jpeg', objectPosition: 'center top' },
    { id: 4, src: '/NossaHistoria (4).jpeg' },
    { id: 5, src: '/NossaHistoria (5).jpeg' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-wedding-accent/20 to-wedding-pearl/20 bg-wedding-primary">
        <h3 className="text-xl sm:text-2xl font-elegant font-semibold mb-4 sm:mb-6 text-slate-50 text-center">Nossa História</h3>
        <div className="text-slate-50 text-center text-sm sm:text-base leading-relaxed [&_p]:m-0 [&_p+p]:mt-3 sm:[&_p+p]:mt-4">
          <p>
            Nossa história começou em 2013, na faculdade, durante o curso de gastronomia. E, como toda boa receita, precisou de alguns ingredientes especiais para dar certo.
          </p>
          <p>
            Guilherme percebeu Bruno logo de cara e resolveu investir. O problema? Bruno não dava a menor moral! Na cabeça dele, Guilherme era metido demais para qualquer aproximação. Felizmente, nem sempre a primeira impressão está certa…
          </p>
          <p>
            Entre aulas, conversas, risadas e muitos momentos compartilhados, o que começou com certa desconfiança foi se transformando em amizade, cumplicidade e, sem que percebêssemos, em uma linda história de amor.
          </p>
          <p>
            Os anos passaram, vivemos muitas aventuras, enfrentamos desafios, colecionamos memórias e descobrimos que formávamos uma ótima dupla — dentro e fora da cozinha. Afinal, amor também é isso: saber misturar diferenças, temperar a vida com paciência e celebrar cada conquista juntos.
          </p>
          <p>
            E foi em um lugar muito especial para nós, o Deck, cenário de tantas lembranças, que aconteceu o pedido de casamento. Um momento cheio de emoção que marcou oficialmente o início da contagem regressiva para este grande dia.
          </p>
          <p>
            Agora, depois de tantos anos de história, chegou a hora de celebrar tudo o que construímos juntos. No dia 22 de agosto de 2026, vamos dizer &ldquo;sim&rdquo; diante das pessoas que amamos e que fizeram parte dessa caminhada.
          </p>
          <p>
            Obrigado por estarem aqui e por compartilharem conosco este capítulo tão especial. Preparem-se para uma noite de muita alegria, amor e, claro, muita comemoração!
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => {
          const isAboveFold = index < ABOVE_THE_FOLD_COUNT;
          const isLoaded = loadedIds.has(photo.id);
          return (
            <Card
              key={photo.id}
              onClick={() => setSelectedPhoto(index)}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-wedding-secondary"
            >
              <div className="aspect-square relative bg-wedding-primary/10">
                {!isLoaded && (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-wedding-primary/15 to-wedding-secondary/15 animate-pulse"
                    aria-hidden
                  />
                )}
                <img
                  src={photo.src}
                  alt={`Nossa história ${photo.id}`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={
                    'objectPosition' in photo
                      ? { objectPosition: photo.objectPosition }
                      : undefined
                  }
                  loading={isAboveFold ? 'eager' : 'lazy'}
                  decoding="async"
                  onLoad={() => setLoadedIds((prev) => new Set(prev).add(photo.id))}
                />
              </div>
            </Card>
          );
        })}
      </div>
      
      {selectedPhoto !== null && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" 
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-2xl max-h-full">
            <div className="bg-white rounded-lg p-4">
              <div className="relative aspect-square w-full max-w-2xl mx-auto mb-4">
                <img
                  src={photos[selectedPhoto].src}
                  alt={`Nossa história ${photos[selectedPhoto].id}`}
                  className="w-full h-full object-contain rounded"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <p className="text-center font-medium"></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;