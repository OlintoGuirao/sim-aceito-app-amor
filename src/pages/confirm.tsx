import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Guest, getGuests, updateGuestStatus } from '@/lib/firestore';

export function ConfirmPage() {
  const { guestId } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGuest = async () => {
      try {
        const guests = await getGuests();
        const foundGuest = guests.find(g => g.id === guestId);
        
        if (foundGuest) {
          setGuest(foundGuest);
        } else {
          setError('Convidado não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar dados do convidado');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGuest();
  }, [guestId]);

  const handleConfirm = async () => {
    if (!guest) return;

    try {
      await updateGuestStatus(guest.id!, 'confirmed');
      setGuest({ ...guest, status: 'confirmed' });
    } catch (err) {
      setError('Erro ao confirmar presença');
      console.error(err);
    }
  };

  const handleDecline = async () => {
    if (!guest) return;

    try {
      await updateGuestStatus(guest.id!, 'declined');
      setGuest({ ...guest, status: 'declined' });
    } catch (err) {
      setError('Erro ao recusar convite');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(95 22 28 / var(--tw-bg-opacity, 1))' }}>
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Carregando...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(95 22 28 / var(--tw-bg-opacity, 1))' }}>
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-red-500">{error || 'Convidado não encontrado'}</div>
            <Button 
              className="mt-4 w-full"
              onClick={() => navigate('/')}
            >
              Voltar para a página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(95 22 28 / var(--tw-bg-opacity, 1))' }}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Confirmação de Presença</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{guest.name}</h2>
            {guest.email && <p className="text-gray-600">{guest.email}</p>}
            {guest.phone && <p className="text-gray-600">{guest.phone}</p>}
          </div>

          {guest.status === 'pending' ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-4">
                   Podemos contar com a sua presença?
              </p>
              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-black hover:text-black"
                  onClick={handleConfirm}
                >
                  Confirmar Presença
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-black hover:text-black "
                  onClick={handleDecline}
                >
                  Não Poderei Ir
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">
                {guest.status === 'confirmed' 
                  ? 'Presença Confirmada!' 
                  : 'Presença Declinada'}
              </p>
              <p className="text-gray-600 mb-4">
                {guest.status === 'confirmed'
                  ? 'Obrigado por confirmar sua presença! Estamos ansiosos para celebrar com você.'
                  : 'Obrigado por nos informar. Sentiremos sua falta!'}
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Voltar para a página inicial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}