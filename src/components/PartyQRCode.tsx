import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';

const PartyQRCode: React.FC = () => {
  // URL base do seu aplicativo
  const baseUrl = window.location.origin;
  // URL da galeria de fotos
  const galleryUrl = `${baseUrl}/party-gallery/guest`;

  return (
    <Card className="p-6 bg-wedding-primary">
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-2xl font-elegant font-semibold text-slate-50 text-center">
          QR Code para Compartilhar Fotos
        </h3>
        <p className="text-slate-50 text-center">
          Escaneie este QR code para acessar a galeria de fotos da festa
        </p>
        <div className="p-4 bg-white rounded-lg">
          <QRCodeSVG
            value={galleryUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="text-sm text-slate-50/70 text-center">
          Após escanear, você poderá ver e compartilhar fotos da festa
        </p>
      </div>
    </Card>
  );
};

export default PartyQRCode; 