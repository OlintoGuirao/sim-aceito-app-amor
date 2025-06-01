import React, { useState, useEffect } from 'react';
import { collection, doc, query, orderBy, getDocs, updateDoc, addDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, X, Lock, Trophy, Crown, Clock, Copy, DollarSign } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface RaffleTicket {
  id: string;
  number: number;
  guestName: string;
  purchasedAt: Date;
  isWinner: boolean;
  winningPrize?: number;
  paymentStatus: 'pending' | 'confirmed' | 'under_review';
  expiresAt: Date;
}

const Raffle: React.FC = () => {
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<RaffleTicket[]>([]);
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [currentTickets, setCurrentTickets] = useState<RaffleTicket[]>([]);
  const { user } = useAuth();
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingNumber, setDrawingNumber] = useState<number | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const PAYMENT_TIMEOUT = 30 * 60 * 1000; // 30 minutos em milissegundos
  const navigate = useNavigate();

  const totalNumbers = 200; // Total de números disponíveis
  const pricePerTicket = 10; // Preço por número
  const pixKey = '234.553.987.08'; // Chave PIX (email)

  useEffect(() => {
    // Configurar listener em tempo real para atualizações
    const ticketsRef = collection(db, 'raffle_tickets');
    const q = query(ticketsRef);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const fetchedTickets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          purchasedAt: doc.data().purchasedAt.toDate(),
          expiresAt: doc.data().expiresAt?.toDate() // Tornar opcional para evitar erros
        })) as RaffleTicket[];
        
        setTickets(fetchedTickets);

        // Buscar os ganhadores
        const winnerTickets = fetchedTickets
          .filter(ticket => ticket.isWinner)
          .sort((a, b) => (a.winningPrize || 0) - (b.winningPrize || 0));
        
        setWinners(winnerTickets);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao processar tickets:', error);
        toast.error('Erro ao processar dados');
      }
    }, (error) => {
      console.error('Erro ao observar tickets:', error);
      toast.error('Erro ao monitorar atualizações');
    });

    return () => unsubscribe();
  }, []);

  const isNumberTaken = (number: number) => {
    return tickets.some(ticket => 
      ticket.number === number && 
      (ticket.paymentStatus === 'confirmed' || ticket.paymentStatus === 'pending')
    );
  };

  const toggleNumber = (number: number) => {
    if (isNumberTaken(number)) {
      toast.error('Este número já foi selecionado por outro convidado');
      return;
    }

    setSelectedNumbers(prev => {
      const newNumbers = prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number];
      return newNumbers.sort((a, b) => a - b);
    });
  };

  const purchaseTickets = async () => {
    if (selectedNumbers.length === 0 || !guestName) {
      toast.error('Por favor, selecione pelo menos um número e preencha seu nome');
      return;
    }

    // Verificar se algum número já está vendido
    const isAnyNumberTaken = selectedNumbers.some(num => isNumberTaken(num));

    if (isAnyNumberTaken) {
      toast.error('Um ou mais números selecionados já foram vendidos');
      return;
    }

    try {
      const ticketsRef = collection(db, 'raffle_tickets');
      const newTickets: RaffleTicket[] = [];
      const expiresAt = new Date(Date.now() + PAYMENT_TIMEOUT);

      for (const number of selectedNumbers) {
        const ticketData = {
          number,
          guestName,
          purchasedAt: new Date(),
          isWinner: false,
          paymentStatus: 'pending' as const,
          expiresAt
        };

        const docRef = await addDoc(ticketsRef, ticketData);
        newTickets.push({ id: docRef.id, ...ticketData });
      }

      setCurrentTickets(newTickets);
      setShowPixDialog(true);
      
      // Limpar formulário
      setSelectedNumbers([]);
      setGuestName('');

      // Iniciar timer para cancelamento automático
      setTimeout(async () => {
        for (const ticket of newTickets) {
          const ticketRef = doc(db, 'raffle_tickets', ticket.id);
          const ticketDoc = await getDoc(ticketRef);
          
          if (ticketDoc.exists() && ticketDoc.data().paymentStatus === 'pending') {
            await deleteDoc(ticketRef);
            toast.error(`Número ${ticket.number} cancelado por falta de pagamento`);
          }
        }
      }, PAYMENT_TIMEOUT);
    } catch (error) {
      console.error('Erro ao comprar tickets:', error);
      toast.error('Erro ao comprar números');
    }
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    toast.success('Chave PIX copiada!');
  };

  const availableNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1)
    .filter(num => !isNumberTaken(num));

  const totalValue = selectedNumbers.length * pricePerTicket;

  const handleBuyTicket = () => {
    navigate('/raffle/buy');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4">
      {/* Card de Apresentação */}
      <Card className="p-3 md:p-6 text-center bg-gradient-to-r from-wedding-accent/20 to-wedding-blush/20 bg-wedding-primary mb-6">
        <h3 className="text-2xl md:text-3xl font-elegant font-semibold mb-2 text-slate-50">Rifa do Casamento</h3>
        <p className="text-sm md:text-base text-slate-50">
          Participe da nossa rifa e concorra a um prêmio especial!
        </p>
        <p className="text-sm md:text-base text-slate-50 mt-2">
          Preço por número: <span className="font-semibold text-wedding-gold">R$ {pricePerTicket.toFixed(2)}</span>
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna da Esquerda - Grid de Números */}
        <div className="lg:col-span-8">
          <Card className="p-3 md:p-6 bg-wedding-primary">
            <h4 className="text-xl md:text-2xl font-elegant font-semibold text-slate-50 mb-4 text-center">
              {loading ? 'Carregando números...' : 'Números Disponíveis'}
            </h4>
            {!loading && (
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 gap-1.5 md:gap-2">
                {Array.from({ length: totalNumbers }, (_, i) => i + 1).map(num => {
                  const ticket = tickets.find(t => t.number === num);
                  const isTaken = !!ticket;
                  const isSelected = selectedNumbers.includes(num);
                  const isWinner = ticket?.isWinner;

                  return (
                    <button
                      key={num}
                      onClick={() => !isTaken && toggleNumber(num)}
                      disabled={isTaken}
                      className={`
                        relative group
                        aspect-square flex flex-col items-center justify-center text-sm md:text-base rounded-lg transition-all p-1
                        ${isWinner ? 'bg-wedding-gold/20 text-wedding-gold cursor-not-allowed' :
                          isTaken ? 'bg-red-500/20 text-red-200 cursor-not-allowed' :
                          isSelected ? 'bg-green-500 text-white' :
                          'bg-wedding-secondary/20 text-slate-50 hover:bg-wedding-secondary/30'}
                      `}
                      title={isWinner ? `${ticket.winningPrize}º Prêmio - ${ticket.guestName}` : undefined}
                    >
                      <span className="font-medium">{num}</span>
                      {ticket && (
                        <>
                          <span className="text-[10px] md:text-xs mt-1 truncate max-w-full">
                            {ticket.guestName}
                          </span>
                          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full">
                            {isWinner ? (
                              <div className="w-full h-full bg-wedding-gold animate-pulse" title={`${ticket.winningPrize}º Prêmio`} />
                            ) : ticket.paymentStatus === 'confirmed' ? (
                              <div className="w-full h-full bg-green-500" title="Confirmado" />
                            ) : ticket.paymentStatus === 'under_review' ? (
                              <div className="w-full h-full bg-yellow-500" title="Em Análise" />
                            ) : (
                              <div className="w-full h-full bg-red-500" title="Pendente" />
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Coluna da Direita - Formulário e Seleções */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 md:p-6 bg-wedding-primary">
            <h4 className="text-xl md:text-2xl font-elegant font-semibold text-slate-50 mb-6 text-center">
              Seus Dados
            </h4>
            
            <div className="space-y-6">
              {/* Campo de Nome */}
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-50 mb-2">
                  Nome Completo
                </label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="
                    bg-wedding-secondary/20 
                    text-slate-50 
                    h-12 
                    text-base 
                    w-full
                    border-wedding-secondary/30
                    placeholder:text-slate-50/50
                    focus:border-wedding-gold
                    focus:ring-wedding-gold/30
                    transition-colors
                    duration-200
                  "
                  required
                />
              </div>

              {/* Números Selecionados */}
              {selectedNumbers.length > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-wedding-secondary/20 rounded-lg border border-wedding-secondary/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-base font-medium text-slate-50">Números selecionados:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNumbers([])}
                        className="text-slate-50 hover:text-slate-50 hover:bg-wedding-secondary/30"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Limpar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedNumbers.map(num => (
                        <div
                          key={num}
                          className="px-3 py-1.5 bg-wedding-secondary text-black rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {num}
                          <button
                            onClick={() => toggleNumber(num)}
                            className="hover:text-red-500 p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="p-4 bg-wedding-secondary/20 rounded-lg border border-wedding-secondary/30">
                    <p className="text-base text-slate-50/70 mb-1 text-center">Total a Pagar:</p>
                    <p className="text-2xl font-bold text-wedding-gold text-center">
                      R$ {(selectedNumbers.length * pricePerTicket).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-50/50 text-center mt-1">
                      {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número' : 'números'} x R$ {pricePerTicket.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Botão de Compra */}
              <Button
                onClick={purchaseTickets}
                className="w-full h-12 bg-wedding-secondary text-black hover:bg-wedding-gold font-semibold text-base md:text-lg flex items-center justify-center gap-2 transition-all duration-200"
                disabled={selectedNumbers.length === 0 || !guestName}
              >
                <DollarSign className="w-5 h-5" />
                Comprar Números
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {winners.length > 0 && (
        <Card className="p-4 md:p-6 bg-wedding-primary">
          <div className="text-center mb-6">
            <h4 className="text-2xl md:text-3xl font-elegant font-semibold text-wedding-gold mb-2">
              🎉 Ganhadores da Rifa! 🎉
            </h4>
            <p className="text-sm md:text-base text-slate-50/80">
              Parabéns aos nossos ganhadores!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {winners.map((winner, index) => (
              <Card key={winner.id} className="p-4 bg-wedding-secondary/20 hover:bg-wedding-secondary/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <Trophy className="w-8 h-8 text-wedding-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg md:text-xl font-bold text-wedding-gold mb-2">
                      {index + 1}º Prêmio
                    </p>
                    <div className="space-y-1">
                      <p className="text-base md:text-lg text-slate-50">
                        <span className="text-slate-50/70">Número:</span>{' '}
                        <span className="font-semibold">{winner.number}</span>
                      </p>
                      <p className="text-base md:text-lg text-slate-50">
                        <span className="text-slate-50/70">Ganhador:</span>{' '}
                        <span className="font-semibold">{winner.guestName}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={showPixDialog} onOpenChange={setShowPixDialog}>
        <DialogContent className="bg-wedding-primary text-slate-50 max-w-md w-[90vw] md:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-elegant text-center">Pagamento via PIX</DialogTitle>
            <DialogDescription className="text-center">
              Faça o pagamento de{' '}
              <span className="text-wedding-gold font-semibold">
                R$ {(currentTickets.length * pricePerTicket).toFixed(2)}
              </span>{' '}
              via PIX
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-wedding-secondary/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Chave PIX:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={pixKey}
                  readOnly
                  className="bg-wedding-secondary/30 text-slate-50"
                />
                <Button
                  onClick={copyPixKey}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/20 rounded-lg flex items-start gap-2">
              <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-yellow-500 font-medium">
                  Você tem 30 minutos para fazer o pagamento
                </p>
                <p className="text-xs text-yellow-500/80">
                  Após este período, os números selecionados serão liberados automaticamente
                </p>
              </div>
            </div>

            <div className="text-sm text-center text-slate-50/70">
              Após realizar o pagamento, entre em contato com o administrador para confirmar sua compra
            </div>

            <Button 
              onClick={() => setShowPixDialog(false)}
              className="w-full h-12 text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold text-base md:text-lg"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="bg-wedding-primary text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-elegant">
              🎉 Ganhadores da Rifa! 🎉
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {winners.map((winner, index) => (
              <div key={winner.id} className="text-center space-y-4">
                <div className="animate-bounce mb-4">
                  <Trophy className="w-16 h-16 text-wedding-gold mx-auto" />
                </div>
                <p className="text-xl font-bold text-wedding-gold">
                  {index + 1}º Prêmio
                </p>
                <p className="text-3xl font-bold text-wedding-gold">
                  Número {winner.number}
                </p>
                <p className="text-xl text-slate-50">
                  {winner.guestName}
                </p>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => setShowWinnerDialog(false)}
            className="w-full text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Raffle; 