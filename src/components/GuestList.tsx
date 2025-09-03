import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GuestImport } from './GuestImport';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Share2 } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  group: string;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt: string;
  companions: number;
}

export function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadGuests = async () => {
    try {
      const guestsRef = collection(db, "guests");
      const q = query(guestsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const guestsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Guest[];

      setGuests(guestsList);
    } catch (error) {
      console.error('Erro ao carregar convidados:', error);
      toast.error('Erro ao carregar convidados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este convidado?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "guests", id));
      setGuests(guests.filter(guest => guest.id !== id));
      toast.success('Convidado excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir convidado:', error);
      toast.error('Erro ao excluir convidado');
    }
  };

  const handleSendInvite = (guest: Guest) => {
    const message = `Olá ${guest.name}! 🎉\n\nVocê está convidado para o nosso casamento!\n\n` +
      `📅 Data: 25 de abril de 2026\n` +
      `⏰ Horário: 16:30\n` +
      `📍 Local: Espaço Cascata\n\n` +
      `Para confirmar sua presença, acesse:\n` +
      `https://sim-aceito.com.br/confirmar/${guest.id}\n\n` +
      `Contamos com sua presença! 💕\n` +
      `Fabíola e Juninho`;

    const whatsappUrl = `https://wa.me/${guest.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Guest['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500';
      case 'declined':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusText = (status: Guest['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'declined':
        return 'Recusado';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className="space-y-6">
      <GuestImport onImport={loadGuests} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Convidados</CardTitle>
          <CardDescription>
            Gerencie seus convidados e acompanhe as confirmações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar convidados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>{guest.name}</TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>{guest.phone}</TableCell>
                      <TableCell>{guest.group}</TableCell>
                      <TableCell>
                        <span className={getStatusColor(guest.status)}>
                          {getStatusText(guest.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleSendInvite(guest)}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Enviar Convite
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(guest.id)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="p-6 text-center bg-gradient-to-r from-[#f5e6d3]/20 to-[#5f161c]/20">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-black">Lista de Convidados</h3>
        <p className="text-black">
          Gerencie seus convidados e envie convites
        </p>
      </Card>

      <div className="grid gap-4">
        {filteredGuests.map(guest => (
          <Card key={guest.id} className="bg-wedding-secondary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-black">{guest.name}</h4>
                  <p className="text-sm text-gray-600">{guest.email}</p>
                  <p className="text-sm text-gray-600">{guest.phone}</p>
                  <p className="text-sm text-gray-600">
                    Acompanhantes: {guest.companions}
                  </p>
                  <p className="text-sm">
                    Status: 
                    <span className={`ml-2 ${
                      guest.status === 'confirmed' ? 'text-green-600' :
                      guest.status === 'declined' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {guest.status === 'confirmed' ? 'Confirmado' :
                       guest.status === 'declined' ? 'Não Confirmado' :
                       'Pendente'}
                    </span>
                  </p>
                </div>
                <Button
                  className="bg-wedding-primary text-white"
                  onClick={() => handleSendInvite(guest)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Enviar Convite
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 