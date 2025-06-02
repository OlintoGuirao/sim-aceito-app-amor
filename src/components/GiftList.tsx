import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { Gift, CreditCard, QrCode, Mail } from 'lucide-react';

interface GiftItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  link: string;
  status: 'available' | 'reserved' | 'purchased';
  reservedBy?: string;
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

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'casa', name: 'Casa' },
    { id: 'cozinha', name: 'Cozinha' },
    { id: 'decoracao', name: 'Decoração' },
    { id: 'experiencias', name: 'Experiências' },
  ];

  const gifts: GiftItem[] = [
    {
      id: '1',
      name: 'Jogo de Panelas Tramontina',
      category: 'cozinha',
      price: 899.90,
      image: '/images/gifts/panelas.jpg',
      link: 'https://exemplo.com/panelas',
      status: 'available'
    },
    {
      id: '2',
      name: 'Liquidificador Oster',
      category: 'cozinha',
      price: 299.90,
      image: '/images/gifts/liquidificador.jpg',
      link: 'https://exemplo.com/liquidificador',
      status: 'available'
    },
    {
      id: '3',
      name: 'Jogo de Cama Queen',
      category: 'casa',
      price: 199.90,
      image: '/images/gifts/cama.jpg',
      link: 'https://exemplo.com/cama',
      status: 'available'
    },
    // Adicione mais presentes aqui
  ];

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

    try {
      // Aqui você implementaria a lógica de reserva no backend
      toast.success('Presente reservado com sucesso!');
      // Atualizar o status do presente
      gift.status = 'reserved';
      gift.reservedBy = reservationName;
    } catch (error) {
      toast.error('Erro ao reservar presente');
    }
  };

  const pixData = {
    key: '123.456.789-00',
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
            value="pix" 
            className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Pix
          </TabsTrigger>
          <TabsTrigger 
            value="transfer" 
            className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Transferência
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
              {gifts
                .filter(gift => selectedCategory === 'all' || gift.category === selectedCategory)
                .map(gift => (
                  <Card key={gift.id} className="bg-wedding-primary border-wedding-primary">
                    <CardHeader>
                      <CardTitle className="text-wedding-secondary">{gift.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <img 
                          src={gift.image} 
                          alt={gift.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <p className="text-wedding-secondary font-semibold">
                          R$ {gift.price.toFixed(2)}
                        </p>
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

        <TabsContent value="pix">
          <Card className="bg-wedding-primary border-wedding-primary">
            <CardHeader>
              <CardTitle className="text-wedding-secondary">Pix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <QRCodeSVG 
                  value={`PIX: ${pixData.key}`}
                  size={200}
                />
                <div className="text-center space-y-2">
                  <p className="text-wedding-secondary font-semibold">Chave PIX: {pixData.key}</p>
                  <p className="text-wedding-secondary">Titular: {pixData.name}</p>
                </div>
                <Button
                  className="bg-wedding-primary text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.key);
                    toast.success('Chave PIX copiada!');
                  }}
                >
                  Copiar Chave PIX
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
          <Card className="bg-wedding-primary border-wedding-primary">
            <CardHeader>
              <CardTitle className="text-wedding-secondary">Transferência Bancária</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-wedding-secondary font-semibold">Banco</p>
                    <p className="text-wedding-secondary">{pixData.bank}</p>
                  </div>
                  <div>
                    <p className="text-wedding-secondary font-semibold">Agência</p>
                    <p className="text-wedding-secondary">{pixData.agency}</p>
                  </div>
                  <div>
                    <p className="text-wedding-secondary font-semibold">Conta</p>
                    <p className="text-wedding-secondary">{pixData.account}</p>
                  </div>
                  <div>
                    <p className="text-wedding-secondary font-semibold">Titular</p>
                    <p className="text-wedding-secondary">{pixData.name}</p>
                  </div>
                </div>
                <Button
                  className="w-full bg-wedding-primary text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(`${pixData.bank}\nAgência: ${pixData.agency}\nConta: ${pixData.account}\nTitular: ${pixData.name}`);
                    toast.success('Dados bancários copiados!');
                  }}
                >
                  Copiar Dados Bancários
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GiftList;