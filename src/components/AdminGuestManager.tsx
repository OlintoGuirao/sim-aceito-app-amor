import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'confirmed' | 'declined';
  qrCode?: string;
  group?: string;
  table?: number;
}
const AdminGuestManager: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([{
    id: '1',
    name: 'Ana Silva',
    email: 'ana@email.com',
    status: 'confirmed',
    group: 'Família',
    table: 1
  }, {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos@email.com',
    status: 'pending',
    group: 'Amigos'
  }, {
    id: '3',
    name: 'Mariana Costa',
    email: 'mariana@email.com',
    status: 'declined',
    group: 'Trabalho'
  }, {
    id: '4',
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    status: 'pending',
    group: 'Família'
  }]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestGroup, setNewGuestGroup] = useState('');
  const [newGuestTable, setNewGuestTable] = useState('');
  const addGuest = () => {
    if (newGuestName && newGuestEmail) {
      const newGuest: Guest = {
        id: Date.now().toString(),
        name: newGuestName,
        email: newGuestEmail,
        status: 'pending',
        group: newGuestGroup || undefined,
        table: newGuestTable ? parseInt(newGuestTable) : undefined
      };
      setGuests([...guests, newGuest]);
      setNewGuestName('');
      setNewGuestEmail('');
      setNewGuestGroup('');
      setNewGuestTable('');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-[#f5e6d3] text-[#5f161c]';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'declined':
        return 'Recusou';
      default:
        return 'Pendente';
    }
  };
  const confirmedGuests = guests.filter(g => g.status === 'confirmed');
  const pendingGuests = guests.filter(g => g.status === 'pending');
  const declinedGuests = guests.filter(g => g.status === 'declined');
  const generateQRCode = (guestId: string) => {
    // Gera o link para a página de confirmação
    const baseUrl = window.location.origin;
    return `${baseUrl}/confirm/${guestId}`;
  };
  return <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-r from-[#f5e6d3]/20 to-[#5f161c]/20 bg-wedding-secondary">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-[#5f161c]">Gerenciamento de Convidados</h3>
        <p className="text-[#5f161c]/80">
          Área administrativa para gerenciar a lista de convidados
        </p>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-wedding-secondary">
          <div className="text-2xl font-bold text-[#5f161c]">{confirmedGuests.length}</div>
          <div className="text-sm text-[#5f161c]/80">Confirmados</div>
        </Card>
        <Card className="p-4 text-center bg-[#f5e6d3]/20">
          <div className="text-2xl font-bold text-[#5f161c]">{pendingGuests.length}</div>
          <div className="text-sm text-[#5f161c]/80">Pendentes</div>
        </Card>
        <Card className="p-4 text-center bg-[#f5e6d3]/20">
          <div className="text-2xl font-bold text-[#5f161c]">{declinedGuests.length}</div>
          <div className="text-sm text-[#5f161c]/80">Recusaram</div>
        </Card>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#f5e6d3]/20">
          <TabsTrigger value="add" className="data-[state=active]:bg-[#5f161c] data-[state=active]:text-white">Adicionar Convidado</TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-[#5f161c] data-[state=active]:text-white">Lista de Convidados</TabsTrigger>
          <TabsTrigger value="qrcodes" className="data-[state=active]:bg-[#5f161c] data-[state=active]:text-white">QR Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-[#5f161c]">Adicionar Convidado</h3>
            <div className="space-y-4">
              <Input placeholder="Nome do convidado" value={newGuestName} onChange={e => setNewGuestName(e.target.value)} className="border-[#5f161c]/20 focus:border-[#5f161c] focus:ring-[#5f161c]/20" />
              <Input placeholder="Email" type="email" value={newGuestEmail} onChange={e => setNewGuestEmail(e.target.value)} className="border-[#5f161c]/20 focus:border-[#5f161c] focus:ring-[#5f161c]/20" />
              <Input placeholder="Grupo (ex: Família, Amigos, Trabalho)" value={newGuestGroup} onChange={e => setNewGuestGroup(e.target.value)} className="border-[#5f161c]/20 focus:border-[#5f161c] focus:ring-[#5f161c]/20" />
              <Input placeholder="Número da Mesa" type="number" value={newGuestTable} onChange={e => setNewGuestTable(e.target.value)} className="border-[#5f161c]/20 focus:border-[#5f161c] focus:ring-[#5f161c]/20" />
              <Button onClick={addGuest} className="w-full bg-[#f5e6d3] hover:bg-[#5f161c] text-[#5f161c] hover:text-white transition-colors">
                Adicionar Convidado
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-[#5f161c]">Lista de Convidados</h3>
            <div className="space-y-3">
              {guests.map(guest => <div key={guest.id} className="flex items-center justify-between p-3 bg-[#f5e6d3]/10 rounded-lg">
                  <div>
                    <div className="font-medium text-[#5f161c]">{guest.name}</div>
                    <div className="text-sm text-[#5f161c]/80">{guest.email}</div>
                    {guest.group && <div className="text-xs text-[#5f161c]/60">Grupo: {guest.group}</div>}
                    {guest.table && <div className="text-xs text-[#5f161c]/60">Mesa: {guest.table}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(guest.status)}>
                      {getStatusText(guest.status)}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-[#5f161c]/20 hover:bg-[#5f161c] hover:text-white">
                      Editar
                    </Button>
                  </div>
                </div>)}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="qrcodes">
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4 text-[#5f161c]">QR Codes dos Convidados</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {guests.map(guest => <Card key={guest.id} className="p-4 text-center bg-[#f5e6d3]/10">
                  <QRCodeSVG value={generateQRCode(guest.id)} size={128} />
                  <div className="mt-2 text-sm font-medium text-[#5f161c]">{guest.name}</div>
                  <div className="text-xs text-[#5f161c]/80">{guest.email}</div>
                </Card>)}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default AdminGuestManager;