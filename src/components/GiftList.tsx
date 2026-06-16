import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Gift, MapPin, QrCode } from 'lucide-react';
import { getGifts, reserveGift, Gift as FirestoreGift } from '@/lib/firestore';

interface GiftItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  link: string;
  status: 'available' | 'reserved' | 'purchased';
  reservedBy?: string;
  reservedEmail?: string;
}

interface Experience {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  status: 'available' | 'reserved' | 'purchased';
  reservedBy?: string;
}

const GiftList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reservationName, setReservationName] = useState('');
  const [reservationEmail, setReservationEmail] = useState('');
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'casa', name: 'Casa' },
    { id: 'cozinha', name: 'Cozinha' },
    { id: 'decoracao', name: 'Decoração' },
    { id: 'experiencias', name: 'Experiências' },
  ];

  useEffect(() => {
    const fetchGifts = async () => {
      setLoadingGifts(true);
      try {
        const firestoreGifts = await getGifts();
        setGifts(firestoreGifts as GiftItem[]);
      } catch (error) {
        toast.error('Erro ao carregar presentes');
      } finally {
        setLoadingGifts(false);
      }
    };
    fetchGifts();
  }, []);

  const experiences: Experience[] = [
    {
      id: 'exp1',
      name: 'Jantar Romântico',
      description: 'Um jantar especial em um restaurante exclusivo',
      price: 500,
      image: '/images/experiences/jantar.jpg',
      status: 'available'
    },
    {
      id: 'exp2',
      name: 'Passeio de Helicóptero',
      description: 'Um passeio inesquecível sobre a cidade',
      price: 1500,
      image: '/images/experiences/helicoptero.jpg',
      status: 'available'
    },
    // Adicione mais experiências aqui
  ];

  const handleReserveGift = async (gift: GiftItem) => {
    if (!reservationName || !reservationEmail) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    if (gift.status !== 'available') {
      toast.error('Este presente já foi reservado!');
      return;
    }
    try {
      await reserveGift(gift.id, reservationName, reservationEmail);
      setGifts(prev => prev.map(g => g.id === gift.id ? { ...g, status: 'reserved', reservedBy: reservationName, reservedEmail: reservationEmail } : g));
      toast.success('Presente reservado com sucesso!');
    } catch (error) {
      toast.error('Erro ao reservar presente');
    }
  };

  const pixData = {
    key: '16 99283-3829',
    name: 'Guilherme Henrique Faleiros de Souza',
  };

  const physicalStore = {
    name: 'Aquarela Casa',
    address: 'R. Bahia, 1520 - Centro',
    city: 'São Joaquim da Barra - SP, 14600-000',
  };

  const openInMaps = (address: string) => {
    const fullAddress = `${physicalStore.address}, ${physicalStore.city}`;
    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(address || fullAddress)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6 text-center bg-wedding-primary border-wedding-primary">
        <h3 className="text-xl sm:text-2xl font-elegant font-semibold mb-2 text-wedding-secondary">Lista de Presentes</h3>
        <p className="text-wedding-secondary">
          Sua presença é nosso maior presente, mas se desejar nos presentear, aqui estão algumas sugestões
        </p>
      </Card>

      <Tabs defaultValue="gifts" className="w-full">
        <TabsList className="flex flex-col sm:flex-row w-full h-auto bg-wedding-primary p-1 rounded-lg gap-1 mb-6 sm:mb-10">
          <TabsTrigger 
            value="gifts" 
            className="flex-1 w-full min-w-0 bg-wedding-secondary text-black data-[state=active]:bg-wedding-accent data-[state=active]:text-wedding-cream rounded-md text-sm sm:text-base py-2.5"
          >
            <Gift className="w-4 h-4 mr-2 shrink-0" />
            Presentes
          </TabsTrigger>
          <TabsTrigger 
            value="money" 
            className="flex-1 w-full min-w-0 bg-wedding-secondary text-black data-[state=active]:bg-wedding-accent data-[state=active]:text-wedding-cream rounded-md text-sm sm:text-base py-2.5"
          >
            <QrCode className="w-4 h-4 mr-2 shrink-0" />
            Presente em Dinheiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gifts">
          <div className="space-y-6">
            {/* Link destacado para a lista oficial (sem iframe, pois o site bloqueia incorporação) */}
            <Card className="bg-gradient-to-r from-wedding-gold/20 via-wedding-secondary/20 to-wedding-gold/20 border-wedding-gold/40 shadow-2xl ring-1 ring-wedding-gold/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-wedding-primary text-2xl font-elegant">
                    Lista Oficial (Quero de Casamento)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-wedding-primary font-medium">
                      Para presentear, acesse nossa lista oficial. Ela abre em uma nova aba.
                    </p>
                    <p className="text-wedding-primary/80 text-sm mt-1">
                      Preferimos que as compras sejam feitas por lá para facilitar o controle.
                    </p>
                  </div>
                  <Button
                    className="bg-wedding-primary text-white hover:bg-wedding-primary/90 shadow-lg hover:shadow-xl px-6 py-3 text-base"
                    onClick={() => window.open('https://www.finalfeliz.de/guifaleiross-brunooliveira', '_blank')}
                  >
                    Abrir Lista Oficial
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-wedding-gold/20 via-wedding-secondary/20 to-wedding-gold/20 border-wedding-gold/40 shadow-2xl ring-1 ring-wedding-gold/30">
              <CardHeader>
                <CardTitle className="text-wedding-primary text-2xl font-elegant">
                  Lista Física
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-wedding-primary font-medium">
                      Também temos lista física na loja {physicalStore.name}.
                    </p>
                    <p className="text-wedding-primary/80 text-sm mt-2 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>
                        {physicalStore.address}
                        <br />
                        {physicalStore.city}
                      </span>
                    </p>
                  </div>
                  <Button
                    className="bg-wedding-primary text-white hover:bg-wedding-primary/90 shadow-lg hover:shadow-xl px-6 py-3 text-base"
                    onClick={() => openInMaps(`${physicalStore.address}, ${physicalStore.city}`)}
                  >
                    Ver no Mapa
                  </Button>
                </div>
              </CardContent>
            </Card>
            {showSuggestions && (
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="bg-wedding-secondary text-black hover:bg-wedding-primary hover:text-white"
                >
                  {category.name}
                </Button>
              ))}
            </div>
            )}

            {showSuggestions && (
            <div id="gift-suggestions-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingGifts ? (
                <div className="col-span-full text-center text-wedding-secondary">Carregando presentes...</div>
              ) : gifts
                .filter(gift => selectedCategory === 'all' || gift.category === selectedCategory)
                .map(gift => (
                  <Card key={gift.id} className="bg-wedding-primary border-wedding-primary">
                    <CardHeader>
                      <CardTitle className="text-wedding-secondary">{gift.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="relative w-full pt-[100%] bg-wedding-secondary/10 rounded-lg overflow-hidden">
                          <img 
                            src={gift.image} 
                            alt={gift.name}
                            className="absolute inset-0 w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder-gift.png';
                            }}
                          />
                        </div>
                        <p className="text-wedding-secondary font-semibold text-lg">
                          R$ {gift.price.toFixed(2)}
                        </p>
                        {gift.status === 'reserved' && gift.reservedBy ? (
                          <div className="text-wedding-gold font-semibold">Reservado por: {gift.reservedBy}</div>
                        ) : null}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 bg-wedding-primary text-white hover:bg-wedding-primary/90"
                            onClick={() => window.open(gift.link, '_blank')}
                          >
                            Ver na Loja
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 bg-wedding-secondary text-black hover:bg-wedding-primary hover:text-white"
                            onClick={() => window.open('https://www.finalfeliz.de/guifaleiross-brunooliveira', '_blank')}
                          >
                            Presentear na Lista Oficial
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="money">
          <Card className="bg-wedding-primary border-wedding-primary">
            <CardHeader>
              <CardTitle className="text-wedding-secondary text-xl sm:text-2xl font-elegant">Presente em Dinheiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                  <div className="bg-wedding-secondary/10 p-4 sm:p-6 rounded-xl w-full max-w-md">
                    <h3 className="text-xl font-semibold text-wedding-secondary text-center mb-6 flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5" />
                      PIX
                    </h3>
                    <div className="flex justify-center mb-6">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <img
                          src="/Qrcode.png"
                          alt="QR Code para pagamento via PIX"
                          width={200}
                          height={200}
                          className="w-[200px] h-[200px] object-contain"
                        />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="bg-wedding-secondary/20 p-3 rounded-lg">
                        <p className="text-wedding-secondary font-semibold">Chave PIX</p>
                        <p className="text-wedding-secondary text-base sm:text-lg break-words">{pixData.key}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-3 rounded-lg">
                        <p className="text-wedding-secondary font-semibold">Titular</p>
                        <p className="text-wedding-secondary text-base sm:text-lg break-words">{pixData.name}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6 bg-wedding-secondary text-black hover:bg-wedding-gold transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.key);
                        toast.success('Chave PIX copiada!');
                      }}
                    >
                      Copiar Chave PIX
                    </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GiftList;