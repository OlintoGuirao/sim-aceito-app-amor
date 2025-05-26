import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'confirmed' | 'declined';
  qrCode?: string;
}
const GuestManager: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([{
    id: '1',
    name: 'Ana Silva',
    email: 'ana@email.com',
    status: 'confirmed'
  }, {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos@email.com',
    status: 'pending'
  }, {
    id: '3',
    name: 'Mariana Costa',
    email: 'mariana@email.com',
    status: 'declined'
  }, {
    id: '4',
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    status: 'pending'
  }]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const addGuest = () => {
    if (newGuestName && newGuestEmail) {
      const newGuest: Guest = {
        id: Date.now().toString(),
        name: newGuestName,
        email: newGuestEmail,
        status: 'pending'
      };
      setGuests([...guests, newGuest]);
      setNewGuestName('');
      setNewGuestEmail('');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
  return <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-slate-50">
          <div className="text-2xl font-bold text-green-600">{confirmedGuests.length}</div>
          <div className="text-sm text-green-700">Confirmados</div>
        </Card>
        <Card className="p-4 text-center bg-slate-50">
          <div className="text-2xl font-bold text-yellow-600">{pendingGuests.length}</div>
          <div className="text-sm text-yellow-700">Pendentes</div>
        </Card>
        <Card className="p-4 text-center bg-red-50">
          <div className="text-2xl font-bold text-red-600">{declinedGuests.length}</div>
          <div className="text-sm text-red-700">Recusaram</div>
        </Card>
      </div>

      <Card className="p-6 bg-wedding-primary">
        <h3 className="text-lg font-semibold mb-4 text-slate-50">Adicionar Convidado</h3>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Nome do convidado" value={newGuestName} onChange={e => setNewGuestName(e.target.value)} className="bg-slate-50" />
          <Input placeholder="Email" type="email" value={newGuestEmail} onChange={e => setNewGuestEmail(e.target.value)} className="bg-slate-50" />
          <Button onClick={addGuest} className="bg-wedding-primary hover:bg-wedding-rose">
            Adicionar
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lista de Convidados</h3>
        <div className="space-y-3">
          {guests.map(guest => <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{guest.name}</div>
                <div className="text-sm text-gray-600">{guest.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(guest.status)}>
                  {getStatusText(guest.status)}
                </Badge>
                <Button size="sm" variant="outline">
                  QR Code
                </Button>
              </div>
            </div>)}
        </div>
      </Card>
    </div>;
};
export default GuestManager;