import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

const ABOVE_THE_FOLD_COUNT = 6; // primeiras imagens com loading eager

const PhotoGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set());
  const photos = [
  { id: 2, src:  '/Foto2.webp',            },
  { id: 4, src:  '/Foto4.webp',            },
  { id: 5, src:  '/foto5.webp',            },
  { id: 8, src:  '/Foto8.webp',            },
  { id: 9, src:  '/Foto9.webp',            },
  { id: 10, src: '/FotoHistoria (1).webp', },
  { id: 11, src: '/FotoHistoria (2).webp', },
  { id: 12, src: '/FotoHistoria (3).webp', },
  { id: 13, src: '/FotoHistoria (4).webp', },
  { id: 14, src: '/FotoHistoria (5).webp', },
  { id: 15, src: '/FotoHistoria (6).webp', },
  { id: 17, src: '/FotoHistoria (8).webp', },
  { id: 18, src: '/FotoHistoria (9).webp', },
  { id: 19, src: '/FotoHistoria (10).webp',},
  { id: 20, src: '/FotoHistoria (11).webp',},
  { id: 21, src: '/FotoHistoria (12).webp',},
  { id: 22, src: '/FotoHistoria (13).webp',},
  { id: 23, src: '/FotoHistoria (14).webp',},
  { id: 24, src: '/FotoHistoria (15).webp',},
  { id: 25, src: '/FotoHistoria (16).webp',},
  { id: 26, src: '/FotoHistoria (17).webp',},
  { id: 27, src: '/FotoHistoria (18).webp',},
  { id: 28, src: '/FotoHistoria (19).webp',},
  { id: 30, src: '/FotoHistoria (21).webp',},
  { id: 31, src: '/FotoHistoria (22).webp',},
  { id: 32, src: '/FotoHistoria (23).webp',},
  { id: 33, src: '/FotoHistoria (24).webp',}
];

  return (
    <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-r from-wedding-accent/20 to-wedding-pearl/20 bg-wedding-primary">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-slate-50">Nossa História</h3>
        <p className="text-slate-50">
          Essa história começa em 2015, quando o querido casal se conheceu na Etec da cidade natal, São Joaquim da Barra. <br />
          Mas não iremos abordar isso de uma maneira tão formal, até porque todos aqui devem conhecer ao menos um pouquinho do casal e de suas personalidades. <br />
          Enfim, eles se conheceram através de um amigo em comum, no intervalo do técnico, da tal Etec citada, mas o contato entre eles era pouco, realizado apenas nos 15 minutos do intervalo — e nada mais. <br /><br />
          Após algum tempo, o nosso noivo encontra a bela dama com quem vai se casar, em uma rede social, e toma três segundos de coragem para falar com ela. Foram tempos conversando e, no fim, ele se tornou o melhor amigo dela e sabia tudo sobre sua vida.
          Corta para 2020, pois, nesse meio-tempo, cada um seguiu sua vida, e houveram inúmeros desencontros e empecilhos no caminho dos dois. <br />
          Mas, por um acaso do destino, o encontro, que não acontecia há anos, finalmente aconteceu. E um comentário bobo, o qual Fabíola não acreditou que o Juninho lembraria (sabemos que ele não se lembra de muitas coisas), acabou causando a retomada de uma bela amizade. <br />
          O tempo foi passando, ambos estavam cada vez mais próximos e a vida fluindo bem. Porém, em um belo dia, em uma situação um pouco inesperada, Juninho decide se arriscar e pedir permissão para namorar a bela noiva. Detalhe: os pais permitiram, mas ela não sabia do fato. <br />
          Diante do ocorrido, o namoro se inicia em 24/04/2021. <br />
          Um ano e meio depois, e com diversos acontecimentos que poderiam ter separado os dois, ou poderiam ter feito ambas as partes pensar em desistir (e olha que foram situações deveras irritantes!), surpreendendo o total de uma pessoa, os pombinhos permaneceram juntos. <br />
          Em 29/10/2022, o noivado veio, com um pedido bem dinâmico e a cara do noivo. <br />
          De lá até aqui, foram diversos acontecimentos, porque a vida desses dois nunca está calma... <br />
          Mas hoje, felizes, sonhando e trabalhando juntos para construir o futuro do seu jeito, estão compartilhando esse momento e contando com a presença de quem quiser fazer parte, para dar início a essa novíssima etapa e serem felizes, em paz.
        </p>
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
                  alt=""
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={isAboveFold ? 'eager' : 'lazy'}
                  decoding="async"
                  onLoad={() => setLoadedIds((prev) => new Set(prev).add(photo.id))}
                />
              </div>
              <div className="p-3 bg-wedding-palha">
                <p className="text-sm font-medium text-center text-gray-950"></p>
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
                  alt=""
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