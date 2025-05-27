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
          Momentos especiais que nos trouxeram até aqui
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

      <Card className="p-6 text-center bg-wedding-blush/20 bg-wedding-primary">
        <h4 className="text-lg font-semibold mb-2 text-slate-50">Compartilhe Conosco!</h4>
        <p className="text-sm mb-4 text-slate-50">
          Após o casamento, você poderá enviar suas fotos da festa para completar nossa galeria.
        </p>
        <div className="text-sm text-muted-foreground">
          <p className="text-slate-50">📧 fotos@simaceito.com</p>
          <p className="text-slate-50">📱 #SimAceitoFabii&amp;Xuniim</p>
        </div>
      </Card>

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