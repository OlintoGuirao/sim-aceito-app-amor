import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EventLocation: React.FC = () => {
  const openInMaps = (addressOrUrl: string) => {
    if (addressOrUrl.startsWith('http')) {
      window.open(addressOrUrl, '_blank');
      return;
    }
    const encodedAddress = encodeURIComponent(addressOrUrl);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  };

  const location = {
    icon: '💍',
    title: 'Cerimônia/Festa',
    name: 'Espaço Tay Eventos - Eventos em São Joaquim da Barra',
    address: 'Estrada SJQ, 70 - Zona Rural\nSão Joaquim da Barra - SP, 14600-000',
    time: '18:30h',
    mapAddress: 'https://maps.app.goo.gl/AUwCoByEznFwnQ4Y8',
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-wedding-primary max-w-lg mx-auto">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-secondary/20 mb-4">
            <span className="text-4xl">{location.icon}</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-50">{location.title}</h3>
        </div>

        <div className="space-y-3 text-center">
          <div>
            <h4 className="font-medium text-slate-50">{location.name}</h4>
            <p className="text-sm text-slate-50 whitespace-pre-line">
              {location.address}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-50">
              <strong>Horário:</strong> {location.time}
            </p>
          </div>

          <Button
            onClick={() => openInMaps(location.mapAddress)}
            className="w-full bg-wedding-secondary hover:bg-wedding-gold text-zinc-950"
          >
            Ver no Mapa
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-wedding-accent/20 to-wedding-blush/20 bg-wedding-primary">
        <h3 className="text-lg font-semibold mb-4 text-center text-slate-50">Informações Importantes</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-slate-50">🚗 Estacionamento</h4>
            <p className="text-sm text-slate-50">
              Estacionamento gratuito disponível.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-slate-50">🏨 Hospedagem</h4>
            <p className="text-sm mb-4 text-slate-50">
              Hotel da Barra - (16) 3818-0101<br />
              Mauad Plaza Hotel - (16) 3818-3100<br />
              São Jorge Hotel - (16) 3811-0900
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventLocation;
