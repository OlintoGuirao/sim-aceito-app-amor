import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ticket, QrCode, X, Clock, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RaffleTicket {
  number: number;
  guestName: string;
  guestEmail: string;
  purchasedAt: Date;
  paymentStatus: 'pending' | 'confirmed' | 'under_review';
  paymentProof?: string;
  isWinner?: boolean;
  expiresAt: Date;
}

const RaffleBuy = () => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [soldNumbers, setSoldNumbers] = useState<number[]>([]);
  const [reservedNumbers, setReservedNumbers] = useState<number[]>([]);

  const pricePerTicket = 10; // Preço por número
  const totalNumbers = 100; // Total de números disponíveis

  useEffect(() => {
    fetchSoldAndReservedNumbers();
  }, []);

  const fetchSoldAndReservedNumbers = async () => {
    try {
      const ticketsRef = collection(db, 'raffle_tickets');
      const q = query(ticketsRef);
      const querySnapshot = await getDocs(q);
      
      const sold: number[] = [];
      const reserved: number[] = [];
      
      querySnapshot.docs.forEach(doc => {
        const ticket = doc.data() as RaffleTicket;
        if (ticket.paymentStatus === 'confirmed') {
          sold.push(ticket.number);
        } else {
          reserved.push(ticket.number);
        }
      });

      setSoldNumbers(sold);
      setReservedNumbers(reserved);
    } catch (error) {
      console.error('Erro ao buscar números:', error);
      toast.error('Erro ao carregar números disponíveis');
    }
  };

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (selectedNumbers.length === 0) {
      toast.error('Por favor, selecione pelo menos um número');
      return;
    }

    setLoading(true);

    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutos para pagamento

      // Criar tickets para cada número selecionado
      for (const number of selectedNumbers) {
        await addDoc(collection(db, 'raffle_tickets'), {
          number,
          guestName: name,
          guestEmail: email,
          purchasedAt: Timestamp.now(),
          paymentStatus: 'pending',
          expiresAt: Timestamp.fromDate(expiresAt)
        });
      }

      setShowPixDialog(true);
    } catch (error) {
      console.error('Erro ao reservar números:', error);
      toast.error('Erro ao reservar números. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = selectedNumbers.length * pricePerTicket;

  return (
    <div className="min-h-screen bg-wedding-primary p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-elegant font-semibold mb-2">
              Comprar Números da Rifa
            </h1>
            <p className="text-gray-600">
              Escolha seus números da sorte!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Seus Dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Números Disponíveis</h2>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalNumbers }, (_, i) => i + 1).map(num => {
                  const isSold = soldNumbers.includes(num);
                  const isReserved = reservedNumbers.includes(num);
                  const isSelected = selectedNumbers.includes(num);

                  return (
                    <button
                      key={num}
                      onClick={() => !isSold && !isReserved && toggleNumber(num)}
                      disabled={isSold || isReserved}
                      className={`
                        p-2 rounded-lg text-center transition-all
                        ${isSold ? 'bg-red-100 text-red-500 cursor-not-allowed' :
                          isReserved ? 'bg-yellow-100 text-yellow-500 cursor-not-allowed' :
                          isSelected ? 'bg-green-500 text-white' :
                          'bg-gray-100 hover:bg-gray-200'}
                      `}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {selectedNumbers.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Números selecionados:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNumbers([])}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNumbers.map(num => (
                    <div
                      key={num}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      {num}
                      <button
                        onClick={() => toggleNumber(num)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="font-medium mt-2">
                  Total: R$ {totalValue.toFixed(2)}
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full bg-wedding-primary text-white"
              disabled={loading || selectedNumbers.length === 0}
            >
              {loading ? 'Processando...' : 'Confirmar Compra'}
            </Button>
          </div>
        </Card>

        <Dialog open={showPixDialog} onOpenChange={setShowPixDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pagamento via PIX</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <QrCode className="w-32 h-32 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Escaneie o QR Code ou copie a chave PIX abaixo
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-gray-100 px-3 py-1 rounded">
                    chave.pix@exemplo.com
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText('chave.pix@exemplo.com');
                      toast.success('Chave PIX copiada!');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <Clock className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    Você tem 30 minutos para realizar o pagamento
                  </p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Valor total: R$ {totalValue.toFixed(2)}</p>
                <p>Após o pagamento, envie o comprovante para validação</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RaffleBuy; 