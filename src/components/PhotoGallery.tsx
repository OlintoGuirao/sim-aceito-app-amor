import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
const PhotoGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const photos = [{
    id: 1,
    src: '/placeholder.svg',
    caption: 'Nosso primeiro encontro'
  }, {
    id: 2,
    src: '/placeholder.svg',
    caption: 'Pedido de casamento'
  }, {
    id: 3,
    src: '/placeholder.svg',
    caption: 'Ensaio pré-wedding'
  }, {
    id: 4,
    src: '/placeholder.svg',
    caption: 'Escolhendo as alianças'
  }, {
    id: 5,
    src: '/placeholder.svg',
    caption: 'Prova do vestido'
  }, {
    id: 6,
    src: '/placeholder.svg',
    caption: 'Despedida de solteiro(a)'
  }];
  return <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-r from-wedding-accent/20 to-wedding-pearl/20 bg-wedding-primary">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-slate-50">Nossa História</h3>
        <p className="text-slate-50">
          Momentos especiais que nos trouxeram até aqui
        </p>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => <Card key={photo.id} onClick={() => setSelectedPhoto(index)} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-wedding-secondary">
            <div className="aspect-square bg-gradient-to-br from-wedding-primary/20 to-wedding-secondary/20 flex items-center justify-center bg-wedding-primary">
              <span className="text-4xl">📸</span>
            </div>
            <div className="p-3 bg-wedding-palha">
              <p className="text-sm font-medium text-center text-gray-950">{photo.caption}</p>
            </div>
          </Card>)}
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

      {selectedPhoto !== null && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="max-w-2xl max-h-full">
            <div className="bg-white rounded-lg p-4">
              <div className="aspect-square bg-gradient-to-br from-wedding-primary/20 to-wedding-secondary/20 flex items-center justify-center rounded mb-4">
                <span className="text-6xl">📸</span>
              </div>
              <p className="text-center font-medium">{photos[selectedPhoto].caption}</p>
            </div>
          </div>
        </div>}
    </div>;
};
export default PhotoGallery;