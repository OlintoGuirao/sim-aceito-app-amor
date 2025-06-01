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
import { Mail, QrCode, Share2, Check, Trash2, MessageCircle, Ticket, Send, X, Users } from "lucide-react";
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, onSnapshot, addDoc, Timestamp, where } from 'firebase/firestore';
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
    phone: ''
  });
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
    if (!newGuest.name || !newGuest.phone) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      // Formata o número de telefone antes de salvar
      const formattedPhone = newGuest.phone
        .replace(/\D/g, '') // Remove tudo que não é número
        .replace(/^0/, '') // Remove o 0 do início se houver
        .replace(/^(\d{2})/, '$1'); // Mantém apenas o DDD e o número

      // Verifica se já existe um grupo com este telefone
      const guestsRef = collection(db, 'guests');
      const q = query(guestsRef, where('phone', '==', formattedPhone));
      const querySnapshot = await getDocs(q);
      
      let groupId = '';
      
      if (!querySnapshot.empty) {
        // Usa o groupId do primeiro convidado encontrado com este telefone
        const existingGuest = querySnapshot.docs[0].data();
        groupId = existingGuest.groupId || `group_${querySnapshot.docs[0].id}`;
        
        // Se o convidado existente não tinha groupId, atualiza ele também
        if (!existingGuest.groupId) {
          await updateDoc(doc(db, 'guests', querySnapshot.docs[0].id), {
            groupId: groupId
          });
        }
      } else {
        // Cria um novo groupId
        groupId = `group_${Date.now()}`;
      }

      const guestRef = collection(db, 'guests');
      await addDoc(guestRef, {
        name: newGuest.name,
        phone: formattedPhone,
        groupId: groupId,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      setNewGuest({
        name: '',
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

  const handleSendInvite = async (guest: Guest) => {
    if (!guest.phone) {
      toast.error('Este convidado não possui telefone cadastrado');
      return;
    }

    try {
      // Formata o número de telefone para o WhatsApp
      const formattedPhone = guest.phone
        .replace(/\D/g, '') // Remove tudo que não é número
        .replace(/^0/, '') // Remove o 0 do início se houver
        .replace(/^(\d{2})/, '55$1'); // Adiciona o código do país (55)

      // Busca todos os convidados do mesmo grupo
      const groupMembers = guests.filter(g => 
        // Compara pelo groupId se existir, senão compara pelo telefone
        (guest.groupId && g.groupId === guest.groupId) || 
        (!guest.groupId && g.phone === guest.phone)
      );

      const baseUrl = window.location.origin;
      let message = '';

      // Se tiver mais de um membro no grupo
      if (groupMembers.length > 1) {
        const memberNames = groupMembers.map(g => g.name).join(' e ');
        message = `Olá ${memberNames}! 🎉\n\nVocês estão convidados para o nosso casamento!\n\n`;
      } else {
        message = `Olá ${guest.name}! 🎉\n\nVocê está convidado para o nosso casamento!\n\n`;
      }

      message += `📅 Data: 15 de Dezembro de 2024\n` +
        `⏰ Horário: 19:00\n` +
        `📍 Local: Espaço de Eventos\n\n`;

      if (groupMembers.length > 1) {
        message += `Para confirmar suas presenças, acessem os links abaixo:\n\n`;
        groupMembers.forEach(member => {
          message += `${member.name}:\n${baseUrl}/confirm/${member.id}\n\n`;
        });
      } else {
        message += `Para confirmar sua presença, acesse:\n${baseUrl}/confirm/${guest.id}\n\n`;
      }

      message += `Contamos com ${groupMembers.length > 1 ? 'suas presenças' : 'sua presença'}! 💑\n` +
        `Fabii e Xuniim`;

      // Usa o formato correto do link do WhatsApp
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast.success(`Convite enviado com sucesso para ${groupMembers.length > 1 ? 'o grupo' : guest.name}`);
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast.error('Erro ao enviar convite');
    }
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

  const handleSendLinkToConfirmed = async () => {
    const confirmedGuests = guests.filter(g => g.status === 'confirmed');
    if (confirmedGuests.length === 0) {
      toast.error('Não há convidados confirmados para enviar o link');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const guest of confirmedGuests) {
      if (!guest.phone) {
        errorCount++;
        continue;
      }

      try {
        const baseUrl = window.location.origin;
        const message = `Olá ${guest.name}! 🎉\n\n` +
          `Aqui está o link para acessar o site do nosso casamento:\n` +
          `${baseUrl}/confirm/${guest.id}\n\n` +
          `Contamos com sua presença! 💑\n` +
          `Fabii e Xuniim`;

        const whatsappUrl = `https://wa.me/${guest.phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        successCount++;
      } catch (error) {
        console.error('Erro ao enviar mensagem para', guest.name, ':', error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Link enviado com sucesso para ${successCount} convidado(s)`);
    }
    if (errorCount > 0) {
      toast.error(`Falha ao enviar para ${errorCount} convidado(s) sem telefone cadastrado`);
    }
  };

  // Agrupar convidados por groupId e separar os sem grupo
  const { groupedGuests, ungroupedGuests } = guests.reduce((acc, guest) => {
    if (guest.groupId) {
      if (!acc.groupedGuests[guest.groupId]) {
        acc.groupedGuests[guest.groupId] = [];
      }
      acc.groupedGuests[guest.groupId].push(guest);
    } else {
      acc.ungroupedGuests.push(guest);
    }
    return acc;
  }, { 
    groupedGuests: {} as Record<string, Guest[]>,
    ungroupedGuests: [] as Guest[]
  });

  // Filtrar convidados baseado no termo de busca
  const filteredUngroupedGuests = ungroupedGuests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroupedGuests = Object.entries(groupedGuests).filter(([_, guests]) =>
    guests.some(guest =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 p-6">
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
                <Input 
                  placeholder="Nome do convidado" 
                  value={newGuest.name} 
                  onChange={e => setNewGuest({...newGuest, name: e.target.value})} 
                  className="bg-wedding-primary text-black" 
                />
                <Input 
                  placeholder="Telefone (com DDD)" 
                  value={newGuest.phone} 
                  onChange={e => setNewGuest({...newGuest, phone: e.target.value})} 
                  className="bg-wedding-primary text-black" 
                />
                <Button 
                  onClick={handleAddGuest} 
                  className="w-full text-black bg-wedding-primary hover:bg-wedding-secondary"
                >
                  Adicionar Convidado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <GuestImport onImport={(importedGuests) => {
            const newGuests = importedGuests.map(guest => ({
              ...guest,
              id: undefined // O Firestore vai gerar o ID
            }));
            setGuests(prevGuests => [...prevGuests, ...newGuests]);
          }} />
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Lista de Convidados</CardTitle>
            </CardHeader>
            <CardContent className="bg-wedding-secondary">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Buscar convidado..."
                      className="w-full bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleSendLinkToConfirmed}
                    size="icon"
                    className="bg-wedding-primary text-white hover:bg-wedding-secondary"
                    title="Enviar Link para Confirmados"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {/* Convidados Agrupados */}
                  {filteredGroupedGuests.map(([groupId, groupMembers]) => (
                    <div key={groupId} className="flex flex-col p-4 border rounded-lg gap-4 bg-wedding-secondary">
                      <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-black" />
                          <span className="text-sm text-black">
                            Grupo: {groupMembers[0].phone}
                          </span>
                        </div>
                        {groupMembers.map(guest => (
                          <div key={guest.id} className="ml-7 mb-4 last:mb-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-medium text-black text-lg">{guest.name}</h3>
                              <Badge 
                                className={`${
                                  guest.status === 'confirmed' 
                                    ? 'bg-green-500 hover:bg-green-600' 
                                    : guest.status === 'declined'
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-yellow-500 hover:bg-yellow-600'
                                } self-start sm:self-auto`}
                              >
                                {guest.status === 'confirmed' 
                                  ? 'Confirmado' 
                                  : guest.status === 'declined'
                                  ? 'Não Confirmado'
                                  : 'Pendente'}
                              </Badge>
                            </div>
                            {guest.email && <p className="text-sm text-black mb-1">{guest.email}</p>}
                            {guest.companions > 0 && (
                              <p className="text-sm text-black mb-1">
                                Acompanhantes: {guest.companions}
                              </p>
                            )}
                            {guest.message && (
                              <p className="text-sm text-black italic mb-2">
                                "{guest.message}"
                              </p>
                            )}
                            {guest.confirmedAt && (
                              <p className="text-xs text-gray-500 mb-1">
                                Confirmado em: {new Date(guest.confirmedAt).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                            {guest.declinedAt && (
                              <p className="text-xs text-gray-500">
                                Declinado em: {new Date(guest.declinedAt).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button 
                                variant={guest.status === 'confirmed' ? 'default' : 'outline'} 
                                onClick={() => handleStatusChange(guest.id!, 'confirmed')} 
                                className={`flex-1 sm:flex-none ${
                                  guest.status === 'confirmed'
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-wedding-primary text-white'
                                }`}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                <span className="whitespace-nowrap">Confirmado</span>
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
                                <X className="h-4 w-4 mr-2" />
                                <span className="whitespace-nowrap">Declinado</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleDeleteGuest(guest.id!)} 
                                className="flex-1 sm:flex-none bg-red-500 text-white hover:bg-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span className="whitespace-nowrap">Excluir</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 border-t pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => handleSendInvite(groupMembers[0])} 
                            className="w-full sm:w-auto bg-wedding-primary text-white"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            <span className="whitespace-nowrap">Enviar Convite para o Grupo</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Convidados Individuais */}
                  {filteredUngroupedGuests.map(guest => (
                    <div key={guest.id} className="flex flex-col p-4 border rounded-lg gap-4 bg-wedding-secondary">
                      <div className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-medium text-black text-lg">{guest.name}</h3>
                          <Badge 
                            className={`${
                              guest.status === 'confirmed' 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : guest.status === 'declined'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-yellow-500 hover:bg-yellow-600'
                            } self-start sm:self-auto`}
                          >
                            {guest.status === 'confirmed' 
                              ? 'Confirmado' 
                              : guest.status === 'declined'
                              ? 'Não Confirmado'
                              : 'Pendente'}
                          </Badge>
                        </div>
                        {guest.email && <p className="text-sm text-black mb-1">{guest.email}</p>}
                        {guest.phone && <p className="text-sm text-black mb-1">{guest.phone}</p>}
                        {guest.companions > 0 && (
                          <p className="text-sm text-black mb-1">
                            Acompanhantes: {guest.companions}
                          </p>
                        )}
                        {guest.message && (
                          <p className="text-sm text-black italic mb-2">
                            "{guest.message}"
                          </p>
                        )}
                        {guest.confirmedAt && (
                          <p className="text-xs text-gray-500 mb-1">
                            Confirmado em: {new Date(guest.confirmedAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {guest.declinedAt && (
                          <p className="text-xs text-gray-500">
                            Declinado em: {new Date(guest.declinedAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
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
                            <Check className="h-4 w-4 mr-2" />
                            <span className="whitespace-nowrap">Confirmado</span>
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
                            <X className="h-4 w-4 mr-2" />
                            <span className="whitespace-nowrap">Declinado</span>
                          </Button>
                          {guest.phone && (
                            <Button 
                              variant="outline" 
                              onClick={() => handleSendInvite(guest)} 
                              className="flex-1 sm:flex-none bg-wedding-primary text-white"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              <span className="whitespace-nowrap">Enviar Convite</span>
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            onClick={() => handleDeleteGuest(guest.id!)} 
                            className="flex-1 sm:flex-none bg-red-500 text-white hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span className="whitespace-nowrap">Excluir</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <select 
                  onChange={e => {
                    const guest = guests.find(g => g.id === e.target.value);
                    setSelectedGuest(guest || null);
                  }} 
                  className="w-full p-3 border rounded bg-wedding-secondary text-black"
                >
                  <option value="">Selecione um convidado</option>
                  {guests.map(guest => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name}
                    </option>
                  ))}
                </select>

                {selectedGuest && (
                  <div className="flex flex-col items-center space-y-4 p-4">
                    <QRCodeSVG 
                      value={`${window.location.origin}/confirm/${selectedGuest.id}`} 
                      size={250} 
                    />
                    <p className="text-base text-black text-center font-medium">
                      QR Code para: {selectedGuest.name}
                    </p>
                    {selectedGuest.email && (
                      <Button 
                        onClick={() => handleSendQRCode(selectedGuest)} 
                        disabled={sendingEmail === selectedGuest.id} 
                        className="w-full sm:w-auto bg-wedding-primary text-white hover:bg-wedding-secondary"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="whitespace-nowrap">Enviar por Email</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Recados</CardTitle>
            </CardHeader>
            <CardContent className="bg-wedding-secondary">
              <div className="space-y-4">
                {messages.map(message => (
                  <div key={message.id} className="bg-wedding-primary/10 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                      <div>
                        <p className="font-medium text-black text-lg">{message.author}</p>
                        <p className="text-sm text-gray-600">
                          {message.createdAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2 self-end sm:self-start">
                        {!message.approved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveMessage(message.id)}
                            className="bg-green-500 text-white hover:bg-green-600"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            <span className="whitespace-nowrap">Aprovar</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span className="whitespace-nowrap">Excluir</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-black text-base">{message.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raffle">
          <Card>
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Rifa</CardTitle>
            </CardHeader>
            <CardContent className="bg-wedding-secondary">
              <Button
                onClick={() => navigate('/raffle')}
                className="w-full bg-wedding-primary text-white hover:bg-wedding-secondary"
              >
                <Ticket className="h-4 w-4 mr-2" />
                Ir para Área da Rifa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}