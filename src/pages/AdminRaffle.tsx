import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { Check, X, Eye, Trash2 } from 'lucide-react';

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

  useEffect(() => {
    fetchTickets();
  }, []);

  const pendingCount = tickets.filter(t => t.paymentStatus === 'pending').length;
  const underReviewCount = tickets.filter(t => t.paymentStatus === 'under_review').length;
  const confirmedCount = tickets.filter(t => t.paymentStatus === 'confirmed').length;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="p-6 bg-wedding-primary">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-elegant font-semibold text-slate-50">
            Gerenciamento da Rifa
          </h1>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-white hover:bg-wedding-secondary"
          >
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
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
        </div>

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
      </Card>
    </div>
  );
};

export default AdminRaffle; 