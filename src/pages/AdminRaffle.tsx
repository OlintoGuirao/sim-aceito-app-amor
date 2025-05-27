import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Crown, Users, DollarSign } from 'lucide-react';

interface RaffleTicket {
  id: string;
  number: number;
  guestName: string;
  guestEmail: string;
  purchasedAt: Date;
  isWinner: boolean;
  paymentStatus: 'pending' | 'confirmed';
}

const AdminRaffle: React.FC = () => {
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<RaffleTicket | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingNumber, setDrawingNumber] = useState<number | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const { user, isAdmin, isMainAdmin } = useAuth();

  const pricePerTicket = 10; // Preço por número

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Acesso restrito a administradores');
      return;
    }
    fetchTickets();
  }, [isAdmin]);

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

  const drawWinner = async () => {
    if (!isAdmin) {
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
      const randomIndex = Math.floor(Math.random() * confirmedTickets.length);
      const winnerTicket = confirmedTickets[randomIndex];

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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 bg-wedding-primary text-center">
          <h2 className="text-xl font-semibold text-slate-50 mb-2">Acesso Restrito</h2>
          <p className="text-slate-50">Esta área é exclusiva para administradores.</p>
        </Card>
      </div>
    );
  }

  const confirmedTickets = tickets.filter(t => t.paymentStatus === 'confirmed');
  const pendingTickets = tickets.filter(t => t.paymentStatus === 'pending');
  const totalRevenue = confirmedTickets.length * pricePerTicket;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="p-6 bg-wedding-primary">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-6 h-6 text-wedding-gold" />
          <h1 className="text-2xl font-elegant font-semibold text-slate-50">Administração da Rifa</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-wedding-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-wedding-gold" />
              <h3 className="text-lg font-semibold text-slate-50">Números Vendidos</h3>
            </div>
            <p className="text-2xl font-bold text-wedding-gold">{confirmedTickets.length}</p>
            <p className="text-sm text-slate-50/70">
              {pendingTickets.length} pendentes de confirmação
            </p>
          </Card>

          {isMainAdmin && (
            <Card className="p-4 bg-wedding-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-wedding-gold" />
                <h3 className="text-lg font-semibold text-slate-50">Total Arrecadado</h3>
              </div>
              <p className="text-2xl font-bold text-wedding-gold">
                R$ {totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-slate-50/70">
                R$ {pricePerTicket.toFixed(2)} por número
              </p>
            </Card>
          )}

          <Card className="p-4 bg-wedding-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-wedding-gold" />
              <h3 className="text-lg font-semibold text-slate-50">Status do Sorteio</h3>
            </div>
            <p className="text-2xl font-bold text-wedding-gold">
              {winner ? 'Realizado' : 'Pendente'}
            </p>
            <p className="text-sm text-slate-50/70">
              {winner ? 'Ganhador definido' : 'Aguardando sorteio'}
            </p>
          </Card>
        </div>

        {!winner && (
          <div className="space-y-4">
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
                disabled={confirmedTickets.length === 0} 
                className="w-full text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
              >
                Realizar Sorteio
              </Button>
            )}
          </div>
        )}

        {winner && (
          <Card className="p-4 bg-wedding-secondary/20">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">Ganhador</h3>
            <div className="space-y-2">
              <p className="text-slate-50">
                <span className="font-medium">Número:</span> {winner.number}
              </p>
              <p className="text-slate-50">
                <span className="font-medium">Nome:</span> {winner.guestName}
              </p>
              <p className="text-slate-50">
                <span className="font-medium">Email:</span> {winner.guestEmail}
              </p>
            </div>
          </Card>
        )}
      </Card>

      <Card className="p-6 bg-wedding-primary">
        <h2 className="text-xl font-semibold text-slate-50 mb-4">Lista de Números Vendidos</h2>
        {loading ? (
          <div className="text-center text-slate-50">Carregando...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-slate-50">Nenhum número vendido ainda.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="p-4 bg-wedding-secondary/20">
                <p className="text-lg font-bold text-wedding-gold mb-2">
                  Número {ticket.number}
                </p>
                <p className="text-sm text-slate-50">{ticket.guestName}</p>
                <p className="text-xs text-slate-50/70">{ticket.guestEmail}</p>
                <p className="text-xs mt-2">
                  <span className={`px-2 py-1 rounded-full ${
                    ticket.paymentStatus === 'confirmed' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {ticket.paymentStatus === 'confirmed' ? '✅ Confirmado' : '⏳ Pendente'}
                  </span>
                </p>
              </Card>
            ))}
          </div>
        )}
      </Card>

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

export default AdminRaffle; 