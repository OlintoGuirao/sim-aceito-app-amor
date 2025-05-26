import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
interface Gift {
  id: string;
  name: string;
  image?: string;
  link: string;
  price: string;
  reserved: boolean;
  reservedBy?: string;
  isPix?: boolean;
}
const GiftList: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([{
    id: 'pix',
    name: 'PIX - Presente em Dinheiro',
    image: '/placeholder.svg',
    link: 'https://nubank.com.br/pagar/1q2w3e4r5t6y7u8i9o0p',
    price: 'Valor à escolha',
    reserved: false,
    isPix: true
  }, {
    id: '1',
    name: 'Jogo de Panelas Inox',
    image: '/placeholder.svg',
    link: 'https://magazineluiza.com.br',
    price: 'R$ 299,90',
    reserved: false
  }, {
    id: '2',
    name: 'Conjunto de Taças de Cristal',
    image: '/placeholder.svg',
    link: 'https://amazon.com.br',
    price: 'R$ 189,90',
    reserved: true,
    reservedBy: 'Ana Silva'
  }, {
    id: '3',
    name: 'Máquina de Café Expresso',
    image: '/placeholder.svg',
    link: 'https://casasbahia.com.br',
    price: 'R$ 899,90',
    reserved: false
  }, {
    id: '4',
    name: 'Jogo de Cama King Size',
    image: '/placeholder.svg',
    link: 'https://magazineluiza.com.br',
    price: 'R$ 459,90',
    reserved: false
  }, {
    id: '5',
    name: 'Liquidificador Premium',
    image: '/placeholder.svg',
    link: 'https://amazon.com.br',
    price: 'R$ 199,90',
    reserved: true,
    reservedBy: 'Carlos Santos'
  }, {
    id: '6',
    name: 'Aspirador de Pó Robot',
    image: '/placeholder.svg',
    link: 'https://casasbahia.com.br',
    price: 'R$ 1.299,90',
    reserved: false
  }]);
  const reserveGift = (giftId: string) => {
    setGifts(gifts.map(gift => gift.id === giftId ? {
      ...gift,
      reserved: true,
      reservedBy: 'Você'
    } : gift));
  };
  return <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-r from-wedding-primary/20 to-wedding-secondary/20 bg-wedding-primary rounded-none">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-slate-50">Lista de Presentes</h3>
        <p className="text-slate-50">
          Escolha um presente especial para os noivos e ajude a construir o novo lar!
        </p>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gifts.map(gift => <Card key={gift.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-wedding-primary">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">{gift.isPix ? '💸' : '🎁'}</span>
            </div>
            
            <div className="p-4 bg-wedding-primary">
              <h4 className="font-semibold mb-2 text-gray-50">{gift.name}</h4>
              <div className="text-lg font-bold text-white mb-3 bg-transparent">{gift.price}</div>
              
              {gift.reserved ? <div className="space-y-2">
                  <Badge className="text-black w-full justify-center bg-wedding-lightPalha">
                    Reservado por {gift.reservedBy}
                  </Badge>
                </div> : <div className="space-y-2">
                  {gift.isPix ? (
                    <Button onClick={() => window.open(gift.link, '_blank')} className="w-full hover:bg-wedding-rose bg-wedding-secondary text-gray-950">
                      Fazer PIX
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => reserveGift(gift.id)} className="w-full hover:bg-wedding-rose bg-wedding-secondary text-gray-950">
                        Reservar Presente
                      </Button>
                      <Button variant="outline" onClick={() => window.open(gift.link, '_blank')} className="w-full bg-wedding-secondary text-black">
                        Ver na Loja
                      </Button>
                    </>
                  )}
                </div>}
            </div>
          </Card>)}
      </div>
    </div>;
};
export default GiftList;