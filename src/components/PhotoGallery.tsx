import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

const PhotoGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const photos = [{
    id: 1,
    src: '/Foto1.jpg',
    
  }, {
    id: 2,
    src: '/Foto2.jpg',
    
  }, {
    id: 3,
    src: '/Foto3.jpg',
    
  }, {
    id: 4,
    src: '/Foto4.jpg',
   
  }, {
    id: 5,
    src: '/foto5.jpg',
    
  }, {
    id: 6,
    src: '/Foto6.jpg',
   
  }, {
    id: 7,
    src: '/Foto7.jpg',
   
  }, {
    id: 8,
    src: '/Foto8.jpg',
   
  }, {
    id: 9,
    src: '/Foto9.jpg',
  }];

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
        {photos.map((photo, index) => (
          <Card 
            key={photo.id} 
            onClick={() => setSelectedPhoto(index)} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-wedding-secondary"
          >
            <div className="aspect-square relative">
              <img
                src={photo.src}
                
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 bg-wedding-palha">
              <p className="text-sm font-medium text-center text-gray-950"></p>
            </div>
          </Card>
        ))}
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
                  
                  className="w-full h-full object-contain rounded"
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