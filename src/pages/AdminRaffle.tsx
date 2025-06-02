import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { Check, X, Eye, Trash2, Trophy, DollarSign, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RaffleTicket {
  id: string;
  number: number;
  guestName: string;
  guestEmail: string;
  purchasedAt: Date;
  isWinner: boolean;
  winningPrize?: number; // Número do prêmio (1º ou 2º)
  paymentStatus: 'pending' | 'confirmed' | 'under_review';
  paymentProof?: string;
  expiresAt: Date;
}

const AdminRaffle: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<RaffleTicket | null>(null);
  const [showDrawDialog, setShowDrawDialog] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState<RaffleTicket[]>([]); // Array de ganhadores
  const [currentPrize, setCurrentPrize] = useState<number>(1); // Prêmio atual sendo sorteado
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    // Configurar listener em tempo real para atualizações
    const ticketsRef = collection(db, 'raffle_tickets');
    const q = query(ticketsRef, orderBy('purchasedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchasedAt: doc.data().purchasedAt.toDate(),
        expiresAt: doc.data().expiresAt.toDate()
      })) as RaffleTicket[];
      
      setTickets(fetchedTickets);
      
      // Buscar os ganhadores
      const winnerTickets = fetchedTickets.filter(t => t.isWinner);
      if (winnerTickets.length > 0) {
        setWinners(winnerTickets);
        setCurrentPrize(Math.max(...winnerTickets.map(w => w.winningPrize || 0)) + 1);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Erro ao observar tickets:', error);
      toast.error('Erro ao monitorar atualizações');
    });

    // Limpar listener ao desmontar
    return () => unsubscribe();
  }, []);

  const approvePayment = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, 'raffle_tickets', ticketId);
      await updateDoc(ticketRef, { 
        paymentStatus: 'confirmed'
      });
      toast.success('Pagamento aprovado com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar pagamento:', error);
      toast.error('Erro ao aprovar pagamento');
    }
  };

  const rejectPayment = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, 'raffle_tickets', ticketId);
      await updateDoc(ticketRef, { 
        paymentStatus: 'pending',
        paymentProof: null
      });
      toast.success('Pagamento rejeitado');
    } catch (error) {
      console.error('Erro ao rejeitar pagamento:', error);
      toast.error('Erro ao rejeitar pagamento');
    }
  };

  const viewPaymentProof = (proof: string) => {
    window.open(proof, '_blank');
  };

  const drawWinner = async () => {
    if (isDrawing) return;

    try {
      setIsDrawing(true);
      const confirmedTickets = tickets.filter(t => 
        t.paymentStatus === 'confirmed' && !t.isWinner // Não sortear números que já ganharam
      );
      
      if (confirmedTickets.length === 0) {
        toast.error('Não há tickets confirmados para realizar o sorteio');
        return;
      }

      // Simula um sorteio com animação
      const drawInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * confirmedTickets.length);
        setWinners(prev => {
          const newWinners = [...prev];
          newWinners[currentPrize - 1] = confirmedTickets[randomIndex];
          return newWinners;
        });
      }, 100);

      // Após 3 segundos, define o ganhador final
      setTimeout(async () => {
        clearInterval(drawInterval);
        const finalWinner = confirmedTickets[Math.floor(Math.random() * confirmedTickets.length)];
        
        // Atualiza o ticket como ganhador no banco de dados
        const ticketRef = doc(db, 'raffle_tickets', finalWinner.id);
        await updateDoc(ticketRef, { 
          isWinner: true,
          winningPrize: currentPrize
        });
        
        setWinners(prev => {
          const newWinners = [...prev];
          newWinners[currentPrize - 1] = finalWinner;
          return newWinners;
        });
        setShowDrawDialog(true);
        toast.success(`${currentPrize}º Prêmio sorteado com sucesso!`);
        setCurrentPrize(prev => prev + 1);
      }, 3000);
    } catch (error) {
      console.error('Erro ao realizar sorteio:', error);
      toast.error('Erro ao realizar sorteio');
    } finally {
      setIsDrawing(false);
    }
  };

  const totalValue = tickets.reduce((acc, ticket) => {
    if (ticket.paymentStatus === 'confirmed') {
      return acc + 10; // Preço por número
    }
    return acc;
  }, 0);

  const showTotalValue = user?.email === 'olinto.guirao@gmail.com';

  const pendingCount = tickets.filter(t => t.paymentStatus === 'pending').length;
  const underReviewCount = tickets.filter(t => t.paymentStatus === 'under_review').length;
  const confirmedCount = tickets.filter(t => t.paymentStatus === 'confirmed').length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Não precisa chamar fetchTickets() pois o onSnapshot vai atualizar automaticamente
    setIsRefreshing(false);
  };

  const exportToCSV = () => {
    const confirmedTickets = tickets.filter(t => t.paymentStatus === 'confirmed');
    const csvContent = [
      ['Número', 'Nome', 'Email', 'Data de Compra', 'Status', 'Valor'],
      ...confirmedTickets.map(ticket => [
        ticket.number,
        ticket.guestName,
        ticket.guestEmail,
        ticket.purchasedAt.toLocaleDateString(),
        ticket.paymentStatus,
        'R$ 10,00'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rifa-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = 
        ticket.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.number.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || ticket.paymentStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.purchasedAt.getTime() - a.purchasedAt.getTime();
      }
      if (sortBy === 'number') {
        return a.number - b.number;
      }
      if (sortBy === 'name') {
        return a.guestName.localeCompare(b.guestName);
      }
      return 0;
    });

  const confirmPayment = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, 'raffle_tickets', ticketId);
      await updateDoc(ticketRef, {
        paymentStatus: 'confirmed'
      });
      
      toast.success('Pagamento confirmado com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao confirmar pagamento');
    }
  };

  return (
    <div className="min-h-screen bg-wedding-marsala p-4">
      <Card className="p-3 md:p-6 bg-wedding-primary">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-elegant font-semibold text-slate-50">
            Gerenciamento da Rifa
          </h1>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex-1 md:flex-none bg-white text-wedding-marsala border-2 border-wedding-marsala hover:bg-wedding-marsala hover:text-white group rounded-full shadow-md px-5 py-2 transition-colors duration-200"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 group-hover:text-white text-wedding-marsala ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="flex-1 md:flex-none bg-white text-wedding-marsala border-2 border-wedding-marsala hover:bg-wedding-marsala hover:text-white group rounded-full shadow-md px-5 py-2 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2 group-hover:text-white text-wedding-marsala" />
              Exportar
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 md:flex-none bg-white text-wedding-marsala border-2 border-wedding-marsala hover:bg-wedding-marsala hover:text-white group rounded-full shadow-md px-5 py-2 transition-colors duration-200"
            >
              Sair
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <Card className="p-3 md:p-4 bg-wedding-secondary/20">
            <div className="text-xl md:text-2xl font-bold text-slate-50">{pendingCount}</div>
            <div className="text-xs md:text-sm text-slate-50/70">Pendentes</div>
          </Card>
          <Card className="p-3 md:p-4 bg-wedding-secondary/20">
            <div className="text-xl md:text-2xl font-bold text-slate-50">{underReviewCount}</div>
            <div className="text-xs md:text-sm text-slate-50/70">Em Análise</div>
          </Card>
          <Card className="p-3 md:p-4 bg-wedding-secondary/20">
            <div className="text-xl md:text-2xl font-bold text-slate-50">{confirmedCount}</div>
            <div className="text-xs md:text-sm text-slate-50/70">Confirmados</div>
          </Card>
          {showTotalValue && (
            <Card className="p-3 md:p-4 bg-wedding-secondary/20">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-wedding-gold" />
                <div>
                  <div className="text-xl md:text-2xl font-bold text-slate-50">R$ {totalValue.toFixed(2)}</div>
                  <div className="text-xs md:text-sm text-slate-50/70">Total Arrecadado</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {winners.length > 0 && (
          <Card className="p-4 md:p-6 bg-wedding-secondary/20 mb-4 md:mb-6">
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
                <Card key={winner.id} className="p-4 bg-wedding-primary hover:bg-wedding-primary/90 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <Trophy className="w-8 h-8 text-wedding-gold animate-bounce" />
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

        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1 space-y-3 md:space-y-0 md:flex md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-50/50" />
              <Input
                placeholder="Buscar por nome ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="under_review">Em Análise</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={drawWinner}
            disabled={isDrawing || confirmedCount === 0}
            className={`
              relative overflow-hidden
              bg-gradient-to-r from-wedding-gold via-yellow-500 to-wedding-gold
              text-black font-semibold
              hover:from-yellow-500 hover:via-wedding-gold hover:to-yellow-500
              transition-all duration-500 ease-in-out
              shadow-lg hover:shadow-xl
              transform hover:-translate-y-1
              w-full md:w-auto h-12
              rounded-lg
              ${isDrawing ? 'animate-pulse' : ''}
            `}
          >
            <div className="absolute inset-0 bg-white/10 animate-shimmer" />
            <div className="relative flex items-center justify-center gap-3">
              <Trophy className={`w-6 h-6 ${isDrawing ? 'animate-bounce' : 'animate-float'}`} />
              <span className="text-base font-bold">
                {isDrawing ? 'Sorteando...' : 'Realizar Sorteio'}
              </span>
            </div>
          </Button>
        </div>

        <Card className="p-3 md:p-6 bg-wedding-primary">
          <h2 className="text-lg md:text-xl font-semibold text-slate-50 mb-4">Lista de Números Vendidos</h2>
          {loading ? (
            <div className="text-center text-slate-50">Carregando...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center text-slate-50">Nenhum número encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredTickets.map(ticket => (
                <Card key={ticket.id} className="p-3 md:p-4 bg-wedding-secondary/20 hover:bg-wedding-secondary/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-lg md:text-xl font-bold text-wedding-gold">
                      Nº {ticket.number}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ticket.paymentStatus === 'confirmed' 
                        ? 'bg-green-500/20 text-green-500' 
                        : ticket.paymentStatus === 'under_review'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                    }`}>
                      {ticket.paymentStatus === 'confirmed' ? '✅ Confirmado' : 
                       ticket.paymentStatus === 'under_review' ? '⏳ Em Análise' : 
                       '❌ Pendente'}
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-medium text-slate-50">{ticket.guestName}</p>
                  <p className="text-xs text-slate-50/70 mb-2">{ticket.purchasedAt.toLocaleDateString()}</p>
                  
                  {ticket.paymentStatus !== 'confirmed' && (
                    <Button
                      onClick={() => confirmPayment(ticket.id)}
                      className="w-full h-9 bg-green-600 hover:bg-green-700 text-white text-sm"
                    >
                      Confirmar Pagamento
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Dialog open={showDrawDialog} onOpenChange={setShowDrawDialog}>
          <DialogContent className="bg-wedding-primary text-slate-50 w-[90vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-xl md:text-2xl font-elegant">
                🎉 Ganhadores da Rifa! 🎉
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {winners.map((winner, index) => (
                <div key={winner.id} className="text-center space-y-3 md:space-y-4">
                  <div className="animate-bounce mb-4">
                    <Trophy className="w-12 h-12 md:w-16 md:h-16 text-wedding-gold mx-auto" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-wedding-gold">
                    {index + 1}º Prêmio
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-wedding-gold">
                    Número {winner.number}
                  </p>
                  <p className="text-lg md:text-xl text-slate-50">
                    {winner.guestName}
                  </p>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => setShowDrawDialog(false)}
              className="w-full h-10 text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
            >
              Fechar
            </Button>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default AdminRaffle; 