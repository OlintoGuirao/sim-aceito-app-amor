import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Check, X, Eye, Trash2, Trophy, DollarSign, Search, Filter, Download, RefreshCw, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, CheckCircle, Clock } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  const [showConfirmedModal, setShowConfirmedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const ticketsRef = collection(db, 'raffle_tickets');
        const q = query(ticketsRef, orderBy('purchasedAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          try {
            const fetchedTickets = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                number: data.number || 0,
                guestName: data.guestName || '',
                guestEmail: data.guestEmail || '',
                purchasedAt: data.purchasedAt?.toDate() || new Date(),
                isWinner: data.isWinner || false,
                winningPrize: data.winningPrize || 0,
                paymentStatus: data.paymentStatus || 'pending',
                paymentProof: data.paymentProof || '',
                expiresAt: data.expiresAt?.toDate() || new Date()
              } as RaffleTicket;
            });
            
            setTickets(fetchedTickets);
            
            const winnerTickets = fetchedTickets.filter(t => t.isWinner && t.winningPrize);
            if (winnerTickets.length > 0) {
              setWinners(winnerTickets);
              const maxPrize = Math.max(...winnerTickets.map(w => w.winningPrize || 0));
              setCurrentPrize(maxPrize);
            }
          } catch (err) {
            console.error('Erro ao processar tickets:', err);
            setError('Erro ao processar dados dos tickets');
          } finally {
            setLoading(false);
          }
        }, (error) => {
          console.error('Erro ao observar tickets:', error);
          setError('Erro ao monitorar atualizações');
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Erro ao buscar tickets:', err);
        setError('Erro ao carregar tickets');
        setLoading(false);
      }
    };

    fetchTickets();
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
      setError(null);

      const confirmedTickets = tickets.filter(t => 
        t.paymentStatus === 'confirmed' && !t.isWinner && t.number > 0
      );
      
      if (confirmedTickets.length === 0) {
        toast.error('Não há tickets confirmados para realizar o sorteio');
        return;
      }

      const existingWinner = winners.find(w => w && w.winningPrize === currentPrize);
      if (existingWinner) {
        toast.error('Este prêmio já foi sorteado!');
        return;
      }

      let currentWinner: RaffleTicket | null = null;
      const drawInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * confirmedTickets.length);
        currentWinner = confirmedTickets[randomIndex];
        if (currentWinner) {
          setWinners(prev => {
            const newWinners = [...prev];
            newWinners[currentPrize - 1] = {
              ...currentWinner!,
              winningPrize: currentPrize
            };
            return newWinners;
          });
        }
      }, 100);

      setTimeout(async () => {
        try {
          clearInterval(drawInterval);
          if (!currentWinner || !currentWinner.id) {
            throw new Error('Erro ao selecionar ganhador');
          }

          const ticketRef = doc(db, 'raffle_tickets', currentWinner.id);
          await updateDoc(ticketRef, { 
            isWinner: true,
            winningPrize: currentPrize
          });
          
          setWinners(prev => {
            const newWinners = [...prev];
            newWinners[currentPrize - 1] = {
              ...currentWinner!,
              winningPrize: currentPrize
            };
            return newWinners;
          });
          
          setShowDrawDialog(true);
          toast.success(`${currentPrize}º Prêmio sorteado com sucesso!`);
          setCurrentPrize(prev => prev + 1);
        } catch (err) {
          console.error('Erro ao finalizar sorteio:', err);
          setError('Erro ao finalizar sorteio');
          toast.error('Erro ao finalizar sorteio');
        }
      }, 3000);
    } catch (err) {
      console.error('Erro ao realizar sorteio:', err);
      setError('Erro ao realizar sorteio');
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
      if (!ticket) return false;
      
      const matchesSearch = 
        (ticket.guestName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.guestEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.number?.toString() || '').includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || ticket.paymentStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      if (sortBy === 'date') {
        return (b.purchasedAt?.getTime() || 0) - (a.purchasedAt?.getTime() || 0);
      }
      if (sortBy === 'number') {
        return (a.number || 0) - (b.number || 0);
      }
      if (sortBy === 'name') {
        return (a.guestName || '').localeCompare(b.guestName || '');
      }
      return 0;
    });

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ticketsPerPage,
    currentPage * ticketsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: 'date' | 'number' | 'name') => {
    setSortBy(field);
  };

  const handleStatusFilter = (status: 'all' | 'pending' | 'confirmed' | 'expired') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleTicketsPerPageChange = (value: number) => {
    setTicketsPerPage(value);
    setCurrentPage(1);
  };

  const handleConfirmPayment = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, 'raffle_tickets', ticketId);
      await updateDoc(ticketRef, { paymentStatus: 'confirmed' });
      toast.success('Pagamento confirmado com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const handleRejectPayment = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, 'raffle_tickets', ticketId);
      await deleteDoc(ticketRef);
      toast.success('Pagamento declinado e ticket removido com sucesso!');
    } catch (error) {
      console.error('Erro ao declinar pagamento:', error);
      toast.error('Erro ao declinar pagamento');
    }
  };

  const handleExpireTicket = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, 'raffle_tickets', ticketId);
      await updateDoc(ticketRef, { paymentStatus: 'expired' });
      toast.success('Ticket expirado com sucesso!');
    } catch (error) {
      console.error('Erro ao expirar ticket:', error);
      toast.error('Erro ao expirar ticket');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, 'raffle_tickets', ticketId);
      await deleteDoc(ticketRef);
      toast.success('Ticket excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir ticket:', error);
      toast.error('Erro ao excluir ticket');
    }
  };

  const handleViewPaymentProof = (proofUrl: string) => {
    window.open(proofUrl, '_blank');
  };

  const handleDownloadCSV = () => {
    const headers = ['Número', 'Nome', 'Email', 'Data de Compra', 'Status', 'Prêmio'];
    const data = filteredTickets.map(ticket => {
      if (!ticket) return ['', '', '', '', '', ''];
      
      return [
        ticket.number?.toString() || '',
        ticket.guestName || '',
        ticket.guestEmail || '',
        ticket.purchasedAt?.toLocaleDateString() || '',
        ticket.paymentStatus || '',
        ticket.isWinner ? `${ticket.winningPrize}º Prêmio` : ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rifas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-wedding-primary p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-500">
            <h2 className="text-lg font-semibold mb-2">Erro</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wedding-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-50">Painel de Rifas</h1>
            <p className="text-slate-50/70">Gerencie as rifas e realize os sorteios</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadCSV}
              className="bg-wedding-secondary/20 hover:bg-wedding-secondary/30 text-slate-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <Card className="p-3 md:p-6 bg-wedding-primary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-50">Resumo</h2>
              <p className="text-slate-50/70">Estatísticas das rifas</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-wedding-secondary/20 hover:bg-wedding-secondary/30 text-slate-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-wedding-secondary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-50/70">Total de Rifas</p>
                  <p className="text-2xl font-bold text-slate-50">{tickets.length}</p>
                </div>
                <Ticket className="w-8 h-8 text-wedding-gold" />
              </div>
            </Card>

            <Card 
              className="p-4 bg-wedding-secondary/20 cursor-pointer hover:bg-wedding-secondary/30 transition-colors"
              onClick={() => setShowConfirmedModal(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-50/70">Confirmados</p>
                  <p className="text-2xl font-bold text-slate-50">{confirmedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card 
              className="p-4 bg-wedding-secondary/20 cursor-pointer hover:bg-wedding-secondary/30 transition-colors"
              onClick={() => setShowPendingModal(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-50/70">Pendentes</p>
                  <p className="text-2xl font-bold text-slate-50">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-4 bg-wedding-secondary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-50/70">Próximo Prêmio</p>
                  <p className="text-2xl font-bold text-slate-50">{currentPrize}º</p>
                </div>
                <Trophy className="w-8 h-8 text-wedding-gold" />
              </div>
            </Card>
          </div>

          {showTotalValue && (
            <Card className="p-4 bg-wedding-secondary/20 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-50/70">Total Arrecadado</p>
                  <p className="text-2xl font-bold text-slate-50">R$ {totalValue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-wedding-gold" />
              </div>
            </Card>
          )}
        </Card>

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

        {winners.length > 0 && (
          <Card className="p-3 md:p-6 bg-wedding-primary mb-4 md:mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/5 via-transparent to-wedding-gold/5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wedding-gold via-yellow-500 to-wedding-gold" />
            
            <div className="relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-wedding-gold mb-2">
                    🎉 Ganhadores da Rifa! 🎉
                  </h2>
                  <p className="text-slate-50/80 text-lg">
                    Parabéns aos nossos ganhadores!
                  </p>
                </div>
                <div className="w-full md:w-auto">
                  <div className="bg-wedding-gold/10 rounded-lg p-3 text-center">
                    <p className="text-sm text-slate-50/70 mb-1">Próximo Prêmio</p>
                    <p className="text-2xl font-bold text-wedding-gold">
                      {currentPrize}º
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {winners.map((winner, index) => {
                  if (!winner || !winner.winningPrize) return null;
                  
                  return (
                    <Card 
                      key={`winner-${winner.id}-${index}`}
                      className="p-4 bg-wedding-secondary/20 hover:bg-wedding-secondary/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/5 via-transparent to-wedding-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wedding-gold via-yellow-500 to-wedding-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <div className="w-16 h-16 rounded-full bg-wedding-gold/20 flex items-center justify-center group-hover:bg-wedding-gold/30 transition-colors duration-300">
                            <Trophy className="w-8 h-8 text-wedding-gold animate-bounce" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-3xl font-bold text-wedding-gold">
                              {winner.winningPrize}º
                            </span>
                            <span className="text-sm text-slate-50/70">Prêmio</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-slate-50/70 mb-1">Número da Sorte</p>
                              <p className="text-2xl font-bold text-slate-50 bg-wedding-gold/10 rounded-lg p-2 text-center">
                                {winner.number || ''}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-50/70 mb-1">Ganhador</p>
                              <p className="text-lg font-medium text-slate-50">
                                {winner.guestName || ''}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-50/70 mb-1">Data do Sorteio</p>
                              <p className="text-sm text-slate-50">
                                {winner.purchasedAt?.toLocaleDateString() || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        <Card className="p-3 md:p-6 bg-wedding-primary">
          <h2 className="text-lg md:text-xl font-semibold text-slate-50 mb-4">Lista de Números Vendidos</h2>
          {loading ? (
            <div className="text-center text-slate-50">Carregando...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center text-slate-50">Nenhum número encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredTickets.map(ticket => {
                if (!ticket) return null;
                
                return (
                  <Card key={ticket.id} className="p-3 md:p-4 bg-wedding-secondary/20 hover:bg-wedding-secondary/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-lg md:text-xl font-bold text-wedding-gold">
                        Nº {ticket.number || ''}
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
                    <p className="text-sm md:text-base font-medium text-slate-50">{ticket.guestName || ''}</p>
                    <p className="text-xs text-slate-50/70 mb-2">{ticket.purchasedAt?.toLocaleDateString() || ''}</p>
                    
                    {ticket.paymentStatus !== 'confirmed' && (
                      <Button
                        onClick={() => handleConfirmPayment(ticket.id)}
                        className="w-full h-9 bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Confirmar Pagamento
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* Modal de Confirmados */}
        <Dialog open={showConfirmedModal} onOpenChange={setShowConfirmedModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-wedding-primary">
            <DialogHeader>
              <DialogTitle className="text-2xl font-elegant text-slate-50 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Números Confirmados
              </DialogTitle>
              <DialogDescription className="text-slate-50/70">
                Total de {confirmedCount} número(s) confirmado(s)
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-4">
              {tickets
                .filter(t => t.paymentStatus === 'confirmed')
                .map(ticket => (
                  <Card key={ticket.id} className="p-3 md:p-4 bg-wedding-secondary/20 hover:bg-wedding-secondary/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-lg md:text-xl font-bold text-wedding-gold">
                        Nº {ticket.number || ''}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                        ✅ Confirmado
                      </span>
                    </div>
                    <p className="text-sm md:text-base font-medium text-slate-50">{ticket.guestName || ''}</p>
                    <p className="text-xs text-slate-50/70 mb-2">{ticket.purchasedAt?.toLocaleDateString() || ''}</p>
                    {ticket.guestEmail && (
                      <p className="text-xs text-slate-50/60">{ticket.guestEmail}</p>
                    )}
                  </Card>
                ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Pendentes */}
        <Dialog open={showPendingModal} onOpenChange={setShowPendingModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-wedding-primary">
            <DialogHeader>
              <DialogTitle className="text-2xl font-elegant text-slate-50 flex items-center gap-2">
                <Clock className="w-6 h-6 text-yellow-500" />
                Números Pendentes
              </DialogTitle>
              <DialogDescription className="text-slate-50/70">
                Total de {pendingCount} número(s) pendente(s) - Confirme ou decline os pagamentos
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-4">
              {tickets
                .filter(t => t.paymentStatus === 'pending')
                .map(ticket => (
                  <Card key={ticket.id} className="p-3 md:p-4 bg-wedding-secondary/20 hover:bg-wedding-secondary/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-lg md:text-xl font-bold text-wedding-gold">
                        Nº {ticket.number || ''}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-500">
                        ❌ Pendente
                      </span>
                    </div>
                    <p className="text-sm md:text-base font-medium text-slate-50">{ticket.guestName || ''}</p>
                    <p className="text-xs text-slate-50/70 mb-2">{ticket.purchasedAt?.toLocaleDateString() || ''}</p>
                    {ticket.guestEmail && (
                      <p className="text-xs text-slate-50/60 mb-3">{ticket.guestEmail}</p>
                    )}
                    <div className="flex flex-col gap-2 mt-3">
                      <Button
                        onClick={() => {
                          handleConfirmPayment(ticket.id);
                        }}
                        className="w-full h-9 bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar
                      </Button>
                      <Button
                        onClick={() => {
                          handleRejectPayment(ticket.id);
                        }}
                        variant="destructive"
                        className="w-full h-9 bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Declinar
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminRaffle; 