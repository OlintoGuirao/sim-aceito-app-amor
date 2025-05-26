import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
const EventLocation: React.FC = () => {
  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  };
  return <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-wedding-primary">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-primary/20 mb-4">
              <span className="text-2xl">⛪</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-50">Cerimônia</h3>
          </div>
          
          <div className="space-y-3 text-center">
            <div>
              <h4 className="font-medium text-slate-50">Igreja São José</h4>
              <p className="text-sm text-slate-50">
                Rua das Flores, 123<br />
                Centro - São Paulo/SP
              </p>
            </div>
            
            <div>
              <p className="text-sm text-slate-50"><strong>Horário:</strong> 16:00h</p>
              <p className="text-sm text-slate-50">Chegada dos convidados: 15:30h</p>
            </div>
            
            <Button onClick={() => openInMaps('Igreja São José, Rua das Flores, 123, Centro, São Paulo, SP')} className="w-full hover:bg-wedding-rose bg-wedding-secondary text-gray-950">
              Ver no Mapa
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-wedding-primary">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-secondary/20 mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-50">Festa</h3>
          </div>
          
          <div className="space-y-3 text-center">
            <div>
              <h4 className="font-medium text-slate-50">Salão Crystal</h4>
              <p className="text-sm text-slate-50">
                Av. dos Noivos, 456<br />
                Jardim das Rosas - São Paulo/SP
              </p>
            </div>
            
            <div>
              <p className="text-sm text-slate-50"><strong>Horário:</strong> 19:00h</p>
              <p className="text-sm text-slate-50">Jantar seguido de festa</p>
            </div>
            
            <Button onClick={() => openInMaps('Salão Crystal, Av. dos Noivos, 456, Jardim das Rosas, São Paulo, SP')} className="w-full bg-wedding-secondary hover:bg-wedding-gold text-zinc-950">
              Ver no Mapa
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-wedding-accent/20 to-wedding-blush/20 bg-wedding-primary">
        <h3 className="text-lg font-semibold mb-4 text-center text-slate-50">Informações Importantes</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-slate-50">🚗 Estacionamento</h4>
            <p className="text-sm mb-4 text-slate-50">
              Estacionamento gratuito disponível em ambos os locais.
            </p>
            
            <h4 className="font-medium mb-2 text-slate-50">👔 Dress Code</h4>
            <p className="text-sm text-slate-50">
              Traje social. Evitar cores branca, bege e tons muito claros.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-slate-50">🏨 Hospedagem</h4>
            <p className="text-sm mb-4 text-slate-50">
              Hotel Flores (2km) - (11) 3333-4444<br />
              Pousada das Rosas (1,5km) - (11) 2222-5555
            </p>
            
            <h4 className="font-medium mb-2 text-slate-50">🚌 Transporte</h4>
            <p className="text-sm text-slate-50">
              Ônibus disponível saindo da igreja direto para o salão.
            </p>
          </div>
        </div>
      </Card>
    </div>;
};
export default EventLocation;