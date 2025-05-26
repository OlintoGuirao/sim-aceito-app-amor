import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { QrCode, X, Lock, Trophy, Crown } from 'lucide-react';

interface RaffleTicket {
  id: string;
  number: number;
  guestName: string;
  guestEmail: string;
  purchasedAt: Date;
  isWinner: boolean;
  paymentStatus: 'pending' | 'confirmed';
}

const Raffle: React.FC = () => {
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<RaffleTicket | null>(null);
  const [showPixDialog, setShowPixDialog] = useState(false);
  const [currentTickets, setCurrentTickets] = useState<RaffleTicket[]>([]);
  const { user } = useAuth();
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingNumber, setDrawingNumber] = useState<number | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);

  const totalNumbers = 100; // Total de números disponíveis
  const pricePerTicket = 10; // Preço por número
  const pixKey = 'olinto.guirao@gmail.com'; // Chave PIX (email)

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const ticketsRef = collection(db, 'raffle_tickets');
      const querySnapshot = await getDocs(ticketsRef);
      
      const fetchedTickets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchasedAt: doc.data().purchasedAt.toDate()
      })) as RaffleTicket[];
      
      setTickets(fetchedTickets);

      // Buscar o ganhador
      const winnerTicket = fetchedTickets.find(ticket => ticket.isWinner);
      if (winnerTicket) {
        setWinner(winnerTicket);
      }
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

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
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number].sort((a, b) => a - b);
      }
    });
  };

  const purchaseTickets = async () => {
    if (selectedNumbers.length === 0 || !guestName || !guestEmail) {
      toast.error('Por favor, selecione pelo menos um número e preencha seus dados');
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

      for (const number of selectedNumbers) {
        const ticketData = {
          number,
          guestName,
          guestEmail,
          purchasedAt: new Date(),
          isWinner: false,
          paymentStatus: 'pending' as const
        };

        const docRef = await addDoc(ticketsRef, ticketData);
        newTickets.push({ id: docRef.id, ...ticketData });
      }

      setCurrentTickets(newTickets);
      setShowPixDialog(true);
      
      // Limpar formulário
      setSelectedNumbers([]);
      setGuestName('');
      setGuestEmail('');
      
      fetchTickets();
    } catch (error) {
      console.error('Erro ao comprar tickets:', error);
      toast.error('Erro ao comprar números');
    }
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    toast.success('Chave PIX copiada!');
  };

  const confirmPayment = async () => {
    if (currentTickets.length === 0) return;

    try {
      for (const ticket of currentTickets) {
        const ticketRef = doc(db, 'raffle_tickets', ticket.id);
        await updateDoc(ticketRef, { paymentStatus: 'confirmed' });
      }
      
      toast.success('Pagamento confirmado! Seus números estão garantidos.');
      setShowPixDialog(false);
      setCurrentTickets([]);
      fetchTickets();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const drawWinner = async () => {
    if (!user?.isAdmin) {
      toast.error('Apenas administradores podem realizar o sorteio');
      return;
    }

    const confirmedTickets = tickets.filter(ticket => ticket.paymentStatus === 'confirmed');
    if (confirmedTickets.length === 0) {
      toast.error('Não há tickets confirmados para realizar o sorteio');
      return;
    }

    try {
      setIsDrawing(true);
      setDrawingNumber(null);

      // Animação do sorteio
      const animationDuration = 3000; // 3 segundos
      const interval = 100; // Atualiza a cada 100ms
      const steps = animationDuration / interval;
      let currentStep = 0;

      const animationInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * confirmedTickets.length);
        setDrawingNumber(confirmedTickets[randomIndex].number);
        currentStep++;

        if (currentStep >= steps) {
          clearInterval(animationInterval);
          finishDrawing(confirmedTickets);
        }
      }, interval);
    } catch (error) {
      console.error('Erro ao realizar sorteio:', error);
      toast.error('Erro ao realizar sorteio');
      setIsDrawing(false);
    }
  };

  const finishDrawing = async (confirmedTickets: RaffleTicket[]) => {
    try {
      // Selecionar um ticket aleatório entre os confirmados
      const randomIndex = Math.floor(Math.random() * confirmedTickets.length);
      const winnerTicket = confirmedTickets[randomIndex];

      // Atualizar o ticket como vencedor
      const ticketRef = doc(db, 'raffle_tickets', winnerTicket.id);
      await updateDoc(ticketRef, { isWinner: true });

      setWinner(winnerTicket);
      setIsDrawing(false);
      setShowWinnerDialog(true);
      toast.success('Sorteio realizado com sucesso!');
      fetchTickets();
    } catch (error) {
      console.error('Erro ao finalizar sorteio:', error);
      toast.error('Erro ao finalizar sorteio');
      setIsDrawing(false);
    }
  };

  const availableNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1)
    .filter(num => !isNumberTaken(num));

  const totalValue = selectedNumbers.length * pricePerTicket;

  return (
    <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-r from-wedding-accent/20 to-wedding-blush/20 bg-wedding-primary">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-slate-50">Rifa do Casamento</h3>
        <p className="text-slate-50">
          Participe da nossa rifa e concorra a um prêmio especial!
        </p>
        <p className="text-slate-50 mt-2">
          Preço por número: R$ {pricePerTicket.toFixed(2)}
        </p>
        {user?.isAdmin && (
          <div className="mt-4 p-2 bg-wedding-gold/20 rounded-lg inline-flex items-center gap-2">
            <Crown className="w-4 h-4 text-wedding-gold" />
            <span className="text-sm text-wedding-gold">Modo Administrador Ativo</span>
          </div>
        )}
      </Card>

      {winner && (
        <Card className="p-6 bg-wedding-primary text-center">
          <h4 className="text-xl font-elegant font-semibold mb-2 text-slate-50">Ganhador da Rifa!</h4>
          <p className="text-slate-50">
            Número: {winner.number}
          </p>
          <p className="text-slate-50">
            Ganhador: {winner.guestName}
          </p>
        </Card>
      )}

      <Card className="p-6 bg-wedding-primary">
        <h4 className="text-lg font-semibold mb-4 text-slate-50">Comprar Números</h4>
        <div className="space-y-4">
          {selectedNumbers.length > 0 && (
            <div className="p-4 bg-wedding-secondary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-50">Números selecionados:</p>
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
                    className="px-3 py-1 bg-wedding-secondary text-black rounded-full text-sm font-medium flex items-center gap-1"
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
              <p className="text-sm font-medium text-slate-50 mt-2">
                Total: R$ {totalValue.toFixed(2)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalNumbers }, (_, i) => i + 1).map(num => {
              const isTaken = isNumberTaken(num);
              return (
                <Button
                  key={num}
                  variant={selectedNumbers.includes(num) ? "default" : "outline"}
                  onClick={() => toggleNumber(num)}
                  disabled={isTaken}
                  className={`w-full relative ${
                    selectedNumbers.includes(num)
                      ? 'bg-wedding-secondary text-black' 
                      : isTaken
                        ? 'bg-wedding-primary/30 text-slate-50/30 cursor-not-allowed'
                        : 'bg-wedding-primary text-slate-50 border-wedding-secondary'
                  }`}
                >
                  {num}
                  {isTaken && (
                    <Lock className="w-3 h-3 absolute top-1 right-1 text-slate-50/30" />
                  )}
                </Button>
              );
            })}
          </div>

          <Input 
            placeholder="Seu nome" 
            value={guestName} 
            onChange={e => setGuestName(e.target.value)} 
            className="bg-wedding-secondary text-black placeholder:text-black/60" 
          />
          <Input 
            placeholder="Seu email" 
            type="email"
            value={guestEmail} 
            onChange={e => setGuestEmail(e.target.value)} 
            className="bg-wedding-secondary text-black placeholder:text-black/60" 
          />
          <Button 
            onClick={purchaseTickets} 
            disabled={selectedNumbers.length === 0 || !guestName || !guestEmail} 
            className="w-full text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
          >
            Comprar {selectedNumbers.length} Número{selectedNumbers.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </Card>

      {user?.isAdmin && !winner && (
        <Card className="p-6 bg-wedding-primary">
          <h4 className="text-lg font-semibold mb-4 text-slate-50 flex items-center gap-2">
            <Crown className="w-5 h-5 text-wedding-gold" />
            Área do Administrador
          </h4>
          
          <div className="space-y-4">
            <div className="p-4 bg-wedding-secondary/20 rounded-lg">
              <p className="text-sm text-slate-50">
                Total de números confirmados: {tickets.filter(t => t.paymentStatus === 'confirmed').length}
              </p>
              <p className="text-sm text-slate-50">
                Total arrecadado: R$ {(tickets.filter(t => t.paymentStatus === 'confirmed').length * pricePerTicket).toFixed(2)}
              </p>
            </div>

            {isDrawing ? (
              <div className="text-center py-8">
                <div className="animate-bounce mb-4">
                  <Trophy className="w-12 h-12 text-wedding-gold mx-auto" />
                </div>
                <p className="text-4xl font-bold text-wedding-gold mb-2">
                  {drawingNumber || '...'}
                </p>
                <p className="text-slate-50">Sorteando...</p>
              </div>
            ) : (
              <Button 
                onClick={drawWinner} 
                disabled={tickets.filter(t => t.paymentStatus === 'confirmed').length === 0} 
                className="w-full text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
              >
                Realizar Sorteio
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-slate-50">Números Vendidos</h4>
        {loading ? (
          <div className="text-center text-slate-50">Carregando...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-slate-50">Nenhum número vendido ainda. Seja o primeiro a participar!</div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="p-2 text-center bg-wedding-primary/50 backdrop-blur-sm">
                <p className="text-sm font-medium text-slate-50">{ticket.number}</p>
                <p className="text-xs text-slate-50/70">{ticket.guestName}</p>
                <p className="text-xs text-slate-50/50">
                  {ticket.paymentStatus === 'confirmed' ? '✅ Confirmado' : '⏳ Pendente'}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showPixDialog} onOpenChange={setShowPixDialog}>
        <DialogContent className="bg-wedding-primary text-slate-50">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription className="text-slate-50/70">
              Para confirmar sua compra, faça o pagamento via PIX
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-wedding-secondary/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Chave PIX:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-wedding-secondary/30 p-2 rounded text-black">
                  {pixKey}
                </code>
                <Button onClick={copyPixKey} variant="outline" size="sm">
                  Copiar
                </Button>
              </div>
            </div>

            <div className="p-4 bg-wedding-secondary/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Valor a pagar:</p>
              <p className="text-2xl font-bold text-wedding-secondary">
                R$ {(currentTickets.length * pricePerTicket).toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-wedding-secondary/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Seus números:</p>
              <div className="flex flex-wrap gap-2">
                {currentTickets.map(ticket => (
                  <span
                    key={ticket.id}
                    className="px-3 py-1 bg-wedding-secondary text-black rounded-full text-sm font-medium"
                  >
                    {ticket.number}
                  </span>
                ))}
              </div>
            </div>

            <Button 
              onClick={confirmPayment}
              className="w-full text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
            >
              Confirmar Pagamento
            </Button>

            <p className="text-xs text-center text-slate-50/70">
              Após fazer o pagamento, clique em "Confirmar Pagamento" para garantir seus números
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="bg-wedding-primary text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-elegant">
              🎉 Ganhador da Rifa! 🎉
            </DialogTitle>
          </DialogHeader>
          
          {winner && (
            <div className="text-center space-y-4 py-4">
              <div className="animate-bounce mb-4">
                <Trophy className="w-16 h-16 text-wedding-gold mx-auto" />
              </div>
              <p className="text-3xl font-bold text-wedding-gold">
                Número {winner.number}
              </p>
              <p className="text-xl text-slate-50">
                {winner.guestName}
              </p>
              <p className="text-sm text-slate-50/70">
                {winner.guestEmail}
              </p>
            </div>
          )}

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