import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from 'qrcode.react';
import { Guest, addGuest, getGuests, updateGuestStatus, deleteGuest } from '@/lib/firestore';
import { GuestImport } from './GuestImport';
import { toast } from "sonner";
import { Mail, QrCode, Share2, Check, Trash2, MessageCircle, Ticket } from "lucide-react";
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  approved: boolean;
}

export function AdminGuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configurar listener em tempo real para convidados
  useEffect(() => {
    const guestsRef = collection(db, 'guests');
    const q = query(guestsRef, orderBy('createdAt', 'desc'));
    
    // Criar listener em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const guestsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Guest[];
      
      setGuests(guestsList);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar convidados:', error);
      toast.error('Erro ao carregar convidados');
      setLoading(false);
    });

    // Limpar listener quando componente for desmontado
    return () => unsubscribe();
  }, []);

  // Configurar listener em tempo real para mensagens
  useEffect(() => {
    const messagesRef = collection(db, 'party_messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Message[];
      
      setMessages(messagesList);
    }, (error) => {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    });

    return () => unsubscribe();
  }, []);

  const handleAddGuest = async () => {
    if (!newGuest.name) return;
    try {
      const guestRef = collection(db, 'guests');
      await addDoc(guestRef, {
        ...newGuest,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      setNewGuest({
        name: '',
        email: '',
        phone: ''
      });
      
      toast.success('Convidado adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar convidado:', error);
      toast.error('Erro ao adicionar convidado');
    }
  };

  const handleStatusChange = async (guestId: string, status: Guest['status']) => {
    try {
      const guestRef = doc(db, 'guests', guestId);
      await updateDoc(guestRef, {
        status,
        updatedAt: Timestamp.now(),
        ...(status === 'confirmed' ? { confirmedAt: Timestamp.now() } : {}),
        ...(status === 'declined' ? { declinedAt: Timestamp.now() } : {})
      });
      
      toast.success(`Status atualizado para ${status === 'confirmed' ? 'Confirmado' : 'Declinado'}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    try {
      await deleteGuest(guestId);
      setGuests(prev => prev.filter(g => g.id !== guestId));
    } catch (error) {
      console.error('Erro ao deletar convidado:', error);
    }
  };

  const handleSendQRCode = async (guest: Guest) => {
    if (!guest.email) {
      toast.error('Este convidado não possui email cadastrado');
      return;
    }
    setSendingEmail(guest.id);
    try {
      const qrCodeUrl = `${window.location.origin}/confirm/${guest.id}`;
      const response = await fetch('/api/send-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: guest.email,
          name: guest.name,
          qrCodeUrl
        })
      });
      if (!response.ok) {
        throw new Error('Erro ao enviar email');
      }
      toast.success(`QR Code enviado com sucesso para ${guest.name}`);
    } catch (error) {
      console.error('Erro ao enviar QR Code:', error);
      toast.error('Erro ao enviar QR Code');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleSendInvite = (guest: Guest) => {
    if (!guest.phone) {
      toast.error('Este convidado não possui telefone cadastrado');
      return;
    }

    const baseUrl = window.location.origin;
    const message = `Olá ${guest.name}! 🎉\n\nVocê está convidado para o nosso casamento!\n\n` +
      `📅 Data: 15 de Dezembro de 2024\n` +
      `⏰ Horário: 19:00\n` +
      `📍 Local: Espaço de Eventos\n\n` +
      `Para confirmar sua presença, acesse:\n` +
      `${baseUrl}/confirm/${guest.id}\n\n` +
      `Contamos com sua presença! 💑\n` +
      `Fabii e Xuniim`;

    const whatsappUrl = `https://wa.me/${guest.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const pendingCount = guests.filter(g => g.status === 'pending').length;
  const declinedCount = guests.filter(g => g.status === 'declined').length;

  const handleApproveMessage = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'party_messages', messageId);
      await updateDoc(messageRef, {
        approved: true
      });
      
      setMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, approved: true }
          : message
      ));
      
      toast.success('Mensagem aprovada com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar mensagem:', error);
      toast.error('Erro ao aprovar mensagem');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'party_messages', messageId);
      await deleteDoc(messageRef);
      
      setMessages(prev => prev.filter(message => message.id !== messageId));
      toast.success('Mensagem excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      toast.error('Erro ao excluir mensagem');
    }
  };

  return <div className="space-y-6 p-6">
      <Card className="p-6 text-center bg-gradient-to-r from-[#f5e6d3]/20 to-[#5f161c]/20">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-white">Gerenciamento de Convidados</h3>
        <p className="text-white">
          Área administrativa para gerenciar a lista de convidados
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-wedding-secondary">
            <CardTitle className="text-sm font-medium text-black">Confirmados</CardTitle>
          </CardHeader>
          <CardContent className="bg-wedding-secondary">
            <div className="text-2xl font-bold bg-transparent text-black">{confirmedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-wedding-secondary">
            <CardTitle className="text-sm font-medium text-black">Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="bg-wedding-secondary">
            <div className="text-2xl font-bold text-black">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-wedding-secondary">
            <CardTitle className="text-sm font-medium text-black">Declinados</CardTitle>
          </CardHeader>
          <CardContent className="bg-wedding-secondary">
            <div className="text-2xl font-bold text-black">{declinedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="flex flex-wrap w-full bg-wedding-primary p-1 rounded-lg gap-1 mb-20">
          <TabsTrigger value="add" className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md">
            Adicionar Convidado
          </TabsTrigger>
          <TabsTrigger value="import" className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md">
            Importar Lista
          </TabsTrigger>
          <TabsTrigger value="list" className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md">
            Lista de Convidados
          </TabsTrigger>
          <TabsTrigger value="qrcode" className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md">
            QR Code
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md">
            <MessageCircle className="w-4 h-4 mr-2" />
            Recados
          </TabsTrigger>
          <TabsTrigger value="raffle" className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md">
            <Ticket className="w-4 h-4 mr-2" />
            Rifa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="bg-wedding-secondary">
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Adicionar Novo Convidado</CardTitle>
            </CardHeader>
            <CardContent className="bg-wedding-secondary">
              <div className="space-y-4 bg-wedding-secondary">
                <Input placeholder="Nome do convidado" value={newGuest.name} onChange={e => setNewGuest({
                ...newGuest,
                name: e.target.value
              })} className="bg-wedding-primary text-black" />
                <Input placeholder="Email (opcional)" value={newGuest.email} onChange={e => setNewGuest({
                ...newGuest,
                email: e.target.value
              })} className="bg-wedding-primary text-black" />
                <Input placeholder="Telefone (opcional)" value={newGuest.phone} onChange={e => setNewGuest({
                ...newGuest,
                phone: e.target.value
              })} className="bg-wedding-primary text-black" />
                <Button onClick={handleAddGuest} className="text-black bg-wedding-primary">
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <GuestImport onImport={setGuests} />
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card className="mt-4">
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Lista de Convidados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guests.map(guest => <div key={guest.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4 bg-wedding-secondary">
                    <div className="w-full sm:w-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-black">{guest.name}</h3>
                        <Badge 
                          className={`${
                            guest.status === 'confirmed' 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : guest.status === 'declined'
                              ? 'bg-red-500 hover:bg-red-600'
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          }`}
                        >
                          {guest.status === 'confirmed' 
                            ? 'Confirmado' 
                            : guest.status === 'declined'
                            ? 'Não Confirmado'
                            : 'Pendente'}
                        </Badge>
                      </div>
                      {guest.email && <p className="text-sm text-black">{guest.email}</p>}
                      {guest.phone && <p className="text-sm text-black">{guest.phone}</p>}
                      {guest.companions > 0 && (
                        <p className="text-sm text-black">
                          Acompanhantes: {guest.companions}
                        </p>
                      )}
                      {guest.message && (
                        <p className="text-sm text-black italic mt-1">
                          "{guest.message}"
                        </p>
                      )}
                      {guest.confirmedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Confirmado em: {new Date(guest.confirmedAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {guest.declinedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Declinado em: {new Date(guest.declinedAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant={guest.status === 'confirmed' ? 'default' : 'outline'} 
                        onClick={() => handleStatusChange(guest.id!, 'confirmed')} 
                        className={`flex-1 sm:flex-none ${
                          guest.status === 'confirmed'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-wedding-primary text-white'
                        }`}
                      >
                        Confirmado
                      </Button>
                      <Button 
                        variant={guest.status === 'declined' ? 'destructive' : 'outline'} 
                        onClick={() => handleStatusChange(guest.id!, 'declined')} 
                        className={`flex-1 sm:flex-none ${
                          guest.status === 'declined'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'text-white'
                        }`}
                      >
                        Declinado
                      </Button>
                      {guest.phone && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleSendInvite(guest)} 
                          className="flex-1 sm:flex-none bg-wedding-primary text-white"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Enviar Convite
                        </Button>
                      )}
                      {guest.email && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleSendQRCode(guest)} 
                          disabled={sendingEmail === guest.id} 
                          className="bg-wedding-primary text-white"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => handleDeleteGuest(guest.id!)} 
                        className="flex-1 sm:flex-none text-white"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode">
          <Card>
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Gerar QR Code</CardTitle>
            </CardHeader>
            <CardContent className="bg-wedding-secondary">
              <div className="space-y-4">
                <select onChange={e => {
                const guest = guests.find(g => g.id === e.target.value);
                setSelectedGuest(guest || null);
              }} className="w-full p-2 border rounded bg-wedding-secondary text-black">
                  <option value="">Selecione um convidado</option>
                  {guests.map(guest => <option key={guest.id} value={guest.id}>
                      {guest.name}
                    </option>)}
                </select>

                {selectedGuest && <div className="flex flex-col items-center space-y-4">
                    <QRCodeSVG value={`${window.location.origin}/confirm/${selectedGuest.id}`} size={200} />
                    <p className="text-sm text-black text-center">
                      QR Code para: {selectedGuest.name}
                    </p>
                    {selectedGuest.email && <Button onClick={() => handleSendQRCode(selectedGuest)} disabled={sendingEmail === selectedGuest.id} className="bg-wedding-primary text-black hover:bg-wedding-secondary w-full sm:w-auto">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar por Email
                      </Button>}
                  </div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="bg-wedding-secondary">
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Gerenciar Recados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-black">Carregando recados...</div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className="p-4 bg-wedding-primary/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-black">{message.author}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveMessage(message.id)}
                              className="text-green-600 hover:text-green-700"
                              disabled={message.approved}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-800">{message.text}</p>
                        {message.approved && (
                          <div className="mt-2 flex items-center text-green-600">
                            <Check className="w-4 h-4 mr-1" />
                            <span className="text-sm">Aprovado</span>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raffle">
          <Card className="bg-wedding-secondary">
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Gerenciar Rifa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => navigate('/admin/raffle')}
                  className="w-full bg-wedding-primary text-white hover:bg-wedding-primary/90"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Acessar Gerenciamento da Rifa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
}