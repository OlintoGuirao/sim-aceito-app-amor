import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
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
  const [winner, setWinner] = useState<RaffleTicket | null>(null);
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

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const ticketsRef = collection(db, 'raffle_tickets');
      const q = query(ticketsRef, orderBy('purchasedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedTickets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        purchasedAt: doc.data().purchasedAt.toDate(),
        expiresAt: doc.data().expiresAt.toDate()
      })) as RaffleTicket[];
      setTickets(fetchedTickets);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (ticketId: string) => {
    try {
      const ticketRef = doc(db, 'raffle_tickets', ticketId);
      await updateDoc(ticketRef, { 
        paymentStatus: 'confirmed'
      });
      toast.success('Pagamento aprovado com sucesso!');
      fetchTickets();
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
      fetchTickets();
    } catch (error) {
      console.error('Erro ao rejeitar pagamento:', error);
      toast.error('Erro ao rejeitar pagamento');
    }
  };

  const viewPaymentProof = (proof: string) => {
    window.open(proof, '_blank');
  };

  const drawWinner = async () => {
    try {
      setIsDrawing(true);
      const confirmedTickets = tickets.filter(t => t.paymentStatus === 'confirmed');
      
      if (confirmedTickets.length === 0) {
        toast.error('Não há tickets confirmados para realizar o sorteio');
        return;
      }

      // Simula um sorteio com animação
      const drawInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * confirmedTickets.length);
        setWinner(confirmedTickets[randomIndex]);
      }, 100);

      // Após 3 segundos, define o ganhador final
      setTimeout(() => {
        clearInterval(drawInterval);
        const finalWinner = confirmedTickets[Math.floor(Math.random() * confirmedTickets.length)];
        setWinner(finalWinner);
        
        // Atualiza o ticket como ganhador no banco de dados
        const ticketRef = doc(db, 'raffle_tickets', finalWinner.id);
        updateDoc(ticketRef, { isWinner: true });
        
        toast.success('Sorteio realizado com sucesso!');
        setShowDrawDialog(true);
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

  useEffect(() => {
    fetchTickets();
  }, []);

  const pendingCount = tickets.filter(t => t.paymentStatus === 'pending').length;
  const underReviewCount = tickets.filter(t => t.paymentStatus === 'under_review').length;
  const confirmedCount = tickets.filter(t => t.paymentStatus === 'confirmed').length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTickets();
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="p-6 bg-wedding-primary">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-elegant font-semibold text-slate-50">
            Gerenciamento da Rifa
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-white hover:bg-wedding-secondary"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="text-white hover:bg-wedding-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-white hover:bg-wedding-secondary"
            >
              Sair
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-wedding-secondary/20">
            <div className="text-2xl font-bold text-slate-50">{pendingCount}</div>
            <div className="text-sm text-slate-50/70">Pendentes</div>
          </Card>
          <Card className="p-4 bg-wedding-secondary/20">
            <div className="text-2xl font-bold text-slate-50">{underReviewCount}</div>
            <div className="text-sm text-slate-50/70">Em Análise</div>
          </Card>
          <Card className="p-4 bg-wedding-secondary/20">
            <div className="text-2xl font-bold text-slate-50">{confirmedCount}</div>
            <div className="text-sm text-slate-50/70">Confirmados</div>
          </Card>
          <Card className="p-4 bg-wedding-secondary/20">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-wedding-gold" />
              <div>
                <div className="text-2xl font-bold text-slate-50">R$ {totalValue.toFixed(2)}</div>
                <div className="text-sm text-slate-50/70">Total Arrecadado</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-50/50" />
              <Input
                placeholder="Buscar por nome, email ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="under_review">Em Análise</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data de Compra</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={drawWinner}
            disabled={isDrawing || confirmedCount === 0}
            className="bg-wedding-gold text-black hover:bg-wedding-gold/90"
          >
            <Trophy className="w-4 h-4 mr-2" />
            {isDrawing ? 'Realizando Sorteio...' : 'Realizar Sorteio'}
          </Button>
        </div>

        <Card className="p-6 bg-wedding-primary">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">Lista de Números Vendidos</h2>
          {loading ? (
            <div className="text-center text-slate-50">Carregando...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center text-slate-50">Nenhum número encontrado.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTickets.map(ticket => (
                <Card key={ticket.id} className="p-4 bg-wedding-secondary/20 hover:bg-wedding-secondary/30 transition-colors">
                  <p className="text-lg font-bold text-wedding-gold mb-2">
                    Número {ticket.number}
                  </p>
                  <p className="text-sm text-slate-50">{ticket.guestName}</p>
                  <p className="text-xs text-slate-50/70">{ticket.guestEmail}</p>
                  <p className="text-xs text-slate-50/50 mt-1">
                    Comprado em: {ticket.purchasedAt.toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-1 rounded-full ${
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
                    {ticket.paymentProof && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewPaymentProof(ticket.paymentProof!)}
                        className="text-slate-50 hover:text-slate-50 hover:bg-wedding-secondary/30"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {ticket.paymentStatus === 'under_review' && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => approvePayment(ticket.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => rejectPayment(ticket.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      >
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Dialog open={showDrawDialog} onOpenChange={setShowDrawDialog}>
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
              onClick={() => setShowDrawDialog(false)}
              className="w-full text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
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