import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const EventLocation: React.FC = () => {
  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  };

  const menuItems = [
    {
      category: "Entradas",
      items: [
        "Salada Caesar com Frango Grelhado",
        "Carpaccio de Filé Mignon",
        "Bruschettas Variadas"
      ]
    },
    {
      category: "Pratos Principais",
      items: [
        "Filé Mignon ao Molho de Vinho",
        "Peixe Grelhado com Molho de Ervas",
        "Risoto de Cogumelos"
      ]
    },
    {
      category: "Acompanhamentos",
      items: [
        "Arroz com Brócolis",
        "Purê de Batatas",
        "Legumes Grelhados"
      ]
    },
    {
      category: "Sobremesas",
      items: [
        "Petit Gateau",
        "Mousse de Chocolate",
        "Torta de Frutas Vermelhas"
      ]
    }
  ];

  const locations = [
    {
      id: 'ceremony',
      icon: '⛪',
      title: 'Cerimônia',
      name: 'Igreja São José',
      address: 'Rua das Flores, 123\nCentro - São Paulo/SP',
      time: '16:00h',
      arrival: '15:30h',
      mapAddress: 'Igreja São José, Rua das Flores, 123, Centro, São Paulo, SP'
    },
    {
      id: 'party',
      icon: '🎉',
      title: 'Festa',
      name: 'Salão Crystal',
      address: 'Av. dos Noivos, 456\nJardim das Rosas - São Paulo/SP',
      time: '19:00h',
      description: 'Jantar seguido de festa',
      mapAddress: 'Salão Crystal, Av. dos Noivos, 456, Jardim das Rosas, São Paulo, SP'
    },
    {
      id: 'menu',
      icon: '🍽️',
      title: 'Cardápio',
      description: 'Um menu especial preparado com muito carinho para celebrar nossa união',
      isMenu: true
    }
  ];

  return (
    <div className="space-y-6">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {locations.map((location) => (
            <CarouselItem key={location.id} className="md:basis-1/2 lg:basis-1/3">
              <Card className="p-6 bg-wedding-primary h-full">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-secondary/20 mb-4">
                    <span className="text-2xl">{location.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-50">{location.title}</h3>
                </div>
                
                <div className="space-y-3 text-center">
                  {!location.isMenu ? (
                    <>
                      <div>
                        <h4 className="font-medium text-slate-50">{location.name}</h4>
                        <p className="text-sm text-slate-50 whitespace-pre-line">
                          {location.address}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-50"><strong>Horário:</strong> {location.time}</p>
                        {location.arrival && (
                          <p className="text-sm text-slate-50">Chegada dos convidados: {location.arrival}</p>
                        )}
                        {location.description && (
                          <p className="text-sm text-slate-50">{location.description}</p>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => openInMaps(location.mapAddress)} 
                        className="w-full bg-wedding-secondary hover:bg-wedding-gold text-zinc-950"
                      >
                        Ver no Mapa
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-50">
                        {location.description}
                      </p>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-wedding-secondary hover:bg-wedding-gold text-zinc-950">
                            Ver Cardápio
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-wedding-primary text-slate-50 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-elegant text-center text-slate-50">
                              Nosso Cardápio
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid md:grid-cols-2 gap-6 py-4">
                            {menuItems.map((section, index) => (
                              <div key={index} className="space-y-2">
                                <h4 className="text-lg font-semibold text-wedding-secondary">
                                  {section.category}
                                </h4>
                                <ul className="space-y-1">
                                  {section.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="text-sm text-slate-50">
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center mt-4 gap-2">
          <CarouselPrevious className="bg-wedding-secondary hover:bg-wedding-gold text-zinc-950" />
          <CarouselNext className="bg-wedding-secondary hover:bg-wedding-gold text-zinc-950" />
        </div>
      </Carousel>

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
    </div>
  );
};

export default EventLocation;