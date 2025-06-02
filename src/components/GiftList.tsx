import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { Gift, CreditCard, QrCode } from 'lucide-react';
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
    key: '234.553.978.08',
    name: 'Fabii e Xuniim',
    bank: 'Nubank',
    agency: '1234',
    account: '56789-0'
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 text-center bg-wedding-primary border-wedding-primary">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-wedding-secondary">Lista de Presentes</h3>
        <p className="text-wedding-secondary">
          Sua presença é nosso maior presente, mas se desejar nos presentear, aqui estão algumas sugestões
        </p>
      </Card>

      <Tabs defaultValue="gifts" className="w-full">
        <TabsList className="flex flex-wrap w-full bg-wedding-primary p-1 rounded-lg gap-1 mb-10">
          <TabsTrigger 
            value="gifts" 
            className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md"
          >
            <Gift className="w-4 h-4 mr-2" />
            Presentes
          </TabsTrigger>
          <TabsTrigger 
            value="money" 
            className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Presente em Dinheiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gifts">
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 bg-wedding-primary text-white hover:bg-wedding-primary/90"
                            onClick={() => window.open(gift.link, '_blank')}
                          >
                            Ver na Loja
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-1 bg-wedding-primary text-white hover:bg-wedding-primary/90"
                                disabled={gift.status !== 'available'}
                              >
                                Reservar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reservar Presente</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Input
                                  placeholder="Seu nome"
                                  value={reservationName}
                                  onChange={(e) => setReservationName(e.target.value)}
                                />
                                <Input
                                  placeholder="Seu email"
                                  type="email"
                                  value={reservationEmail}
                                  onChange={(e) => setReservationEmail(e.target.value)}
                                />
                                <Button
                                  className="w-full bg-wedding-primary text-white"
                                  onClick={() => handleReserveGift(gift)}
                                >
                                  Confirmar Reserva
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="money">
          <Card className="bg-wedding-primary border-wedding-primary">
            <CardHeader>
              <CardTitle className="text-wedding-secondary text-2xl font-elegant">Presente em Dinheiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-12">
                {/* Seção PIX */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="bg-wedding-secondary/10 p-6 rounded-xl w-full max-w-md">
                    <h3 className="text-xl font-semibold text-wedding-secondary text-center mb-6 flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5" />
                      PIX
                    </h3>
                    <div className="flex justify-center mb-6">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <QRCodeSVG 
                          value={`PIX: ${pixData.key}`}
                          size={200}
                        />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="bg-wedding-secondary/20 p-3 rounded-lg">
                        <p className="text-wedding-secondary font-semibold">Chave PIX</p>
                        <p className="text-wedding-secondary text-lg">{pixData.key}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-3 rounded-lg">
                        <p className="text-wedding-secondary font-semibold">Titular</p>
                        <p className="text-wedding-secondary text-lg">{pixData.name}</p>
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

                <div className="h-px bg-wedding-secondary/20" />

                {/* Seção Transferência Bancária */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-wedding-secondary text-center flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Transferência Bancária
                  </h3>
                  <div className="bg-wedding-secondary/10 p-6 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-wedding-secondary/20 p-4 rounded-lg">
                        <p className="text-wedding-secondary font-semibold mb-2">Banco</p>
                        <p className="text-wedding-secondary text-lg">{pixData.bank}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-4 rounded-lg">
                        <p className="text-wedding-secondary font-semibold mb-2">Agência</p>
                        <p className="text-wedding-secondary text-lg">{pixData.agency}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-4 rounded-lg">
                        <p className="text-wedding-secondary font-semibold mb-2">Conta</p>
                        <p className="text-wedding-secondary text-lg">{pixData.account}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-4 rounded-lg">
                        <p className="text-wedding-secondary font-semibold mb-2">Titular</p>
                        <p className="text-wedding-secondary text-lg">{pixData.name}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6 bg-wedding-secondary text-black hover:bg-wedding-gold transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(`${pixData.bank}\nAgência: ${pixData.agency}\nConta: ${pixData.account}\nTitular: ${pixData.name}`);
                        toast.success('Dados bancários copiados!');
                      }}
                    >
                      Copiar Dados Bancários
                    </Button>
                  </div>
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