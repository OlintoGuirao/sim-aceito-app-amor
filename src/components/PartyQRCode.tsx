import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PartyQRCode: React.FC = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const galleryUrl = `${baseUrl}/party-gallery/guest`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(galleryUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback para navegadores antigos
      const input = document.createElement('input');
      input.value = galleryUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="p-6 bg-wedding-primary">
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-2xl font-elegant font-semibold text-slate-50 text-center">
          Link para Compartilhar Fotos
        </h3>
        <p className="text-slate-50 text-center">
          Use o link abaixo para acessar a galeria de fotos da festa
        </p>
        <div className="p-4 bg-white rounded-lg w-full max-w-md">
          <a
            href={galleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block break-all text-sm text-blue-600 hover:underline text-center"
          >
            {galleryUrl}
          </a>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
            onClick={handleCopy}
          >
            {copied ? 'Copiado!' : 'Copiar link'}
          </Button>
        </div>
        <p className="text-sm text-slate-50/70 text-center">
          Compartilhe este link para que os convidados vejam e enviem fotos da festa
        </p>
      </div>
    </Card>
  );
};

export default PartyQRCode; 