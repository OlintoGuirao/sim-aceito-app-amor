import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  type CarouselApi,
} from "@/components/ui/carousel";

const EventLocation: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const openInMaps = (addressOrUrl: string) => {
    // Se já for um link completo, abre diretamente. Caso contrário, busca pelo endereço.
    if (addressOrUrl.startsWith('http')) {
      window.open(addressOrUrl, '_blank');
      return;
    }
    const encodedAddress = encodeURIComponent(addressOrUrl);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  };

  const menuItems = [
    {
      category: "Mesa de Frios",
      items: [
        "Salame",
        "Presunto",
        "Peito de peru",
        "Queijo Mussarela",
        "Calabresa Acebolada",
        "Maionese com Barquete",
        "Quibe Crú",
        "Azeitona",
        "Torresmo",
        "Batata Frita",
        "Carne Louca",
        "Mini Filão",
        "Frango Frito",
        "Ovo de Codorna"
      ]
    },
    {
      category: "Pratos Principais",
      items: [
        "Arroz",
        "Feijão Gordo",
        "Churrasco De Panela",
        "Parmegiana de Frango",
        "Salada Verde",
        "Maionese",
        "Salada Marroquina",
        "Farofa",
        "Tabule"
      ]
    },
    
    {
      category: "Sobremesas",
      items: [
        "Bolo De Floresta Negra",
        "Sorvete",
        
      ]
    },
    {
      category: "Mesa de Café",
      items: [
        "Café",
        "Bolacha",
        "Queijo Fresco",
        "Doce de Leite"
      ]
    },
    {
      category: "Bebidas",
      items: [
        "Refrigerante",
        "Água sem gás",
        "Suco",
        "Chopp",
        "Cachaça",
        "Batidas",
      ]
    }
  ];

  const locations = [
    {
      id: 'party',
      icon: '💍',
      title: 'Cerimônia/Festa',
      name: 'Espaço Cascata',
      address: 'R. Santa Catarina, 762-1142\nSão Joaquim da Barra - SP, 14600-000',
      time: '16:30h',
      mapAddress: 'https://maps.app.goo.gl/EVRT6FwXfxsrss639'
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
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {locations.map((location) => (
            <CarouselItem key={location.id} className="md:basis-1/2 lg:basis-1/3">
              <Card className="p-6 bg-wedding-primary h-full">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wedding-secondary/20 mb-4">
                    <span className="text-4xl">{location.icon}</span>
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
                        {'arrival' in location && (location as any).arrival && (
                          <p className="text-sm text-slate-50">Chegada dos convidados: {(location as any).arrival}</p>
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
                        <DialogContent className="w-[92vw] sm:max-w-lg md:max-w-2xl text-slate-50 bg-gradient-to-br from-wedding-primary/95 to-wedding-primary/90 sm:rounded-2xl border border-wedding-secondary/20 shadow-xl supports-[backdrop-filter]:backdrop-blur-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                          <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl font-elegant text-center text-slate-50">
                              Nosso Cardápio
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid md:grid-cols-2 gap-6 py-4">
                            {menuItems.map((section, index) => (
                              <div key={index} className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 sm:p-4 shadow-sm transition-colors hover:bg-white/10">
                                <h4 className="text-lg font-semibold text-wedding-secondary">
                                  {section.category}
                                </h4>
                                <ul className="space-y-1.5">
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
          <div className="flex items-center gap-2 mx-4">
            {locations.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  current === index ? 'bg-wedding-secondary' : 'bg-wedding-secondary/30'
                }`}
              />
            ))}
          </div>
          
        </div>
      </Carousel>

      <Card className="p-6 bg-gradient-to-r from-wedding-accent/20 to-wedding-blush/20 bg-wedding-primary">
        <h3 className="text-lg font-semibold mb-4 text-center text-slate-50">Informações Importantes</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-slate-50">🚗 Estacionamento</h4>
            <p className="text-sm mb-4 text-slate-50">
              Estacionamento gratuito disponível.
            </p>
            
            <h4 className="font-medium mb-2 text-slate-50">👔 Dress Code</h4>
            <p className="text-sm text-slate-50">
              Traje social. Evitar cores branca, bege e tons muito claros.
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