import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'confirmed' | 'declined';
  group?: string;
  table?: number;
}

export default function ConfirmPage() {
  const { id } = useParams();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    // Aqui você implementará a busca do convidado no backend
    // Por enquanto, vamos simular com dados mockados
    const mockGuest: Guest = {
      id: id || '',
      name: 'Ana Silva',
      email: 'ana@email.com',
      status: 'pending',
      group: 'Família',
      table: 1
    };
    setGuest(mockGuest);
    setLoading(false);
  }, [id]);

  const handleConfirm = () => {
    // Aqui você implementará a confirmação no backend
    setConfirmed(true);
    if (guest) {
      setGuest({ ...guest, status: 'confirmed' });
    }
  };

  const handleDecline = () => {
    // Aqui você implementará a recusa no backend
    setDeclined(true);
    if (guest) {
      setGuest({ ...guest, status: 'declined' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5e6d3]/10">
        <Card className="w-full max-w-md p-6 bg-white shadow-lg text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-[#f5e6d3] rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-[#f5e6d3] rounded w-1/2 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5e6d3]/10">
        <Card className="w-full max-w-md p-6 bg-white shadow-lg text-center">
          <h1 className="text-2xl font-bold text-[#5f161c] mb-4">Convidado não encontrado</h1>
          <p className="text-[#5f161c]/80">O QR code pode estar inválido ou expirado.</p>
        </Card>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5e6d3]/10">
        <Card className="w-full max-w-md p-6 bg-white shadow-lg text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-[#5f161c] mb-4">Presença Confirmada!</h1>
          <p className="text-[#5f161c]/80 mb-6">
            Obrigado por confirmar sua presença. Estamos ansiosos para celebrar com você!
          </p>
          <div className="text-sm text-[#5f161c]/60">
            <p>Mesa: {guest.table}</p>
            <p>Grupo: {guest.group}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5e6d3]/10">
        <Card className="w-full max-w-md p-6 bg-white shadow-lg text-center">
          <div className="text-6xl mb-4">💝</div>
          <h1 className="text-2xl font-bold text-[#5f161c] mb-4">Obrigado pelo retorno</h1>
          <p className="text-[#5f161c]/80">
            Lamentamos que você não poderá comparecer, mas agradecemos por nos avisar.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5e6d3]/10">
      <Card className="w-full max-w-md p-6 bg-white shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#5f161c] mb-2">Confirme sua Presença</h1>
          <p className="text-[#5f161c]/80">
            Olá, {guest.name}! Por favor, confirme se você poderá comparecer à nossa celebração.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-[#f5e6d3]/20 rounded-lg">
            <h2 className="font-semibold text-[#5f161c] mb-2">Detalhes do Evento</h2>
            <div className="text-sm text-[#5f161c]/80 space-y-1">
              <p>📅 Data: 15 de Junho de 2024</p>
              <p>⏰ Horário: 19:00</p>
              <p>📍 Local: Salão Crystal</p>
              {guest.table && <p>🍽️ Mesa: {guest.table}</p>}
              {guest.group && <p>👥 Grupo: {guest.group}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleConfirm}
            className="w-full bg-[#f5e6d3] hover:bg-[#5f161c] text-[#5f161c] hover:text-white transition-colors"
          >
            Confirmar Presença
          </Button>
          <Button 
            onClick={handleDecline}
            variant="outline"
            className="w-full border-[#5f161c]/20 hover:bg-[#5f161c] hover:text-white"
          >
            Não Poderei Comparecer
          </Button>
        </div>
      </Card>
    </div>
  );
} 