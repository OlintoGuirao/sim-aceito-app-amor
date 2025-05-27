'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from 'next/navigation';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'declined';
  companions: number;
  message?: string;
}

export default function ConfirmPage() {
  const params = useParams();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [companions, setCompanions] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadGuest = async () => {
      try {
        const guestId = params.id as string;
        const guestDoc = await getDoc(doc(db, "guests", guestId));
        
        if (guestDoc.exists()) {
          setGuest({ id: guestDoc.id, ...guestDoc.data() } as Guest);
          setCompanions(guestDoc.data().companions || 0);
        } else {
          toast.error('Convidado não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar convidado:', error);
        toast.error('Erro ao carregar dados do convidado');
      } finally {
        setLoading(false);
      }
    };

    loadGuest();
  }, [params.id]);

  const handleConfirm = async () => {
    if (!guest) return;

    try {
      await updateDoc(doc(db, "guests", guest.id), {
        status: 'confirmed',
        companions,
        message,
        confirmedAt: new Date().toISOString()
      });

      toast.success('Presença confirmada com sucesso!');
      setGuest({ ...guest, status: 'confirmed' });
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      toast.error('Erro ao confirmar presença');
    }
  };

  const handleDecline = async () => {
    if (!guest) return;

    try {
      await updateDoc(doc(db, "guests", guest.id), {
        status: 'declined',
        message,
        declinedAt: new Date().toISOString()
      });

      toast.success('Resposta registrada com sucesso!');
      setGuest({ ...guest, status: 'declined' });
    } catch (error) {
      console.error('Erro ao registrar resposta:', error);
      toast.error('Erro ao registrar resposta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#f5e6d3]/20 to-[#5f161c]/20">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Carregando...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#f5e6d3]/20 to-[#5f161c]/20">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-red-600">Convidado não encontrado</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#f5e6d3]/20 to-[#5f161c]/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-elegant">
            Confirmação de Presença
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{guest.name}</h2>
            <p className="text-gray-600">
              Por favor, confirme sua presença no nosso casamento
            </p>
          </div>

          {guest.status === 'pending' ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número de Acompanhantes
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={companions}
                    onChange={(e) => setCompanions(Number(e.target.value))}
                    className="bg-wedding-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mensagem para os Noivos (opcional)
                  </label>
                  <Input
                    placeholder="Deixe uma mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-wedding-secondary"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-wedding-primary text-white hover:bg-wedding-primary/90"
                >
                  Confirmar Presença
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="flex-1 text-wedding-primary border-wedding-primary hover:bg-wedding-primary/10"
                >
                  Não Poderei Ir
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className={`text-lg font-semibold ${
                guest.status === 'confirmed' ? 'text-green-600' : 'text-red-600'
              }`}>
                {guest.status === 'confirmed' ? 'Presença Confirmada!' : 'Presença Declinada'}
              </div>
              {guest.companions > 0 && (
                <p className="text-gray-600">
                  Acompanhantes: {guest.companions}
                </p>
              )}
              {guest.message && (
                <p className="text-gray-600 italic">
                  "{guest.message}"
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 