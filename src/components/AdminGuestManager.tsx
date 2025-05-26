import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from 'qrcode.react';
import { Guest, addGuest, getGuests, updateGuestStatus, deleteGuest } from '@/lib/firestore';
import { GuestImport } from './GuestImport';
export function AdminGuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Carregar convidados do Firestore
  useEffect(() => {
    loadGuests();
  }, []);
  const loadGuests = async () => {
    try {
      const guestsData = await getGuests();
      setGuests(guestsData);
    } catch (error) {
      console.error('Erro ao carregar convidados:', error);
    }
  };
  const handleAddGuest = async () => {
    if (!newGuest.name) return;
    try {
      await addGuest({
        name: newGuest.name,
        email: newGuest.email,
        phone: newGuest.phone,
        status: 'pending'
      });
      setNewGuest({
        name: '',
        email: '',
        phone: ''
      });
      loadGuests();
    } catch (error) {
      console.error('Erro ao adicionar convidado:', error);
    }
  };
  const handleStatusChange = async (guestId: string, status: Guest['status']) => {
    try {
      await updateGuestStatus(guestId, status);
      loadGuests();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };
  const handleDeleteGuest = async (guestId: string) => {
    try {
      await deleteGuest(guestId);
      loadGuests();
    } catch (error) {
      console.error('Erro ao deletar convidado:', error);
    }
  };
  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const pendingCount = guests.filter(g => g.status === 'pending').length;
  const declinedCount = guests.filter(g => g.status === 'declined').length;
  return <div className="space-y-6 p-6">
      <Card className="p-6 text-center bg-gradient-to-r from-[#f5e6d3]/20 to-[#5f161c]/20">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-black">Gerenciamento de Convidados</h3>
        <p className="text-black">
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
        <TabsList className="grid w-full grid-cols-4 bg-wedding-primary">
          <TabsTrigger value="add" className="bg-wedding-secondary text-black">Adicionar Convidado</TabsTrigger>
          <TabsTrigger value="import" className="bg-wedding-secondary text-black">Importar Lista</TabsTrigger>
          <TabsTrigger value="list" className="bg-wedding-secondary text-black">Lista de Convidados</TabsTrigger>
          <TabsTrigger value="qrcode" className="text-black bg-wedding-secondary">QR Code</TabsTrigger>
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
          <GuestImport onImport={loadGuests} />
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader className="bg-wedding-secondary">
              <CardTitle className="text-black">Lista de Convidados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guests.map(guest => <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg bg-wedding-lightPalha">
                    <div>
                      <h3 className="font-medium text-black">{guest.name}</h3>
                      {guest.email && <p className="text-sm text-black">{guest.email}</p>}
                      {guest.phone && <p className="text-sm text-black">{guest.phone}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant={guest.status === 'confirmed' ? 'default' : 'outline'} onClick={() => handleStatusChange(guest.id!, 'confirmed')} className="text-white bg-wedding-primary">
                        Confirmado
                      </Button>
                      <Button variant={guest.status === 'declined' ? 'destructive' : 'outline'} onClick={() => handleStatusChange(guest.id!, 'declined')} className="text-white bg-wedding-primary">
                        Declinado
                      </Button>
                      <Button variant="outline" onClick={() => handleDeleteGuest(guest.id!)}>
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
                    <p className="text-sm text-black">
                      QR Code para: {selectedGuest.name}
                    </p>
                  </div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
}