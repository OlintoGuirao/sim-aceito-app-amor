import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Guest, getGuests, updateGuestStatus } from '@/lib/firestore';
import {
  MapPin,
  Wine,
  Gift,
  QrCode,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const WEDDING = {
  coupleNames: 'Bruno & Guilherme',
  day: '22',
  month: 'Agosto',
  year: '2026',
  time: '18h30',
  venue: 'Espaço Tay Eventos',
  address: 'Estrada SJQ, 70 - Zona Rural',
  city: 'São Joaquim da Barra - SP, 14600-000',
  mapsUrl: 'https://maps.app.goo.gl/AUwCoByEznFwnQ4Y8',
  giftsUrl: 'https://www.finalfeliz.de/guifaleiross-brunooliveira',
  siteUrl: 'https://simaceito.com.br/',
};

const PIX = {
  key: '16 99283-3829',
  name: 'Guilherme Henrique Faleiros de Souza',
};

function InviteIconButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group min-w-0"
    >
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-wedding-cream flex items-center justify-center text-wedding-primary ring-2 ring-white/40 shadow-lg transition-transform group-hover:scale-105 group-active:scale-95 group-hover:bg-white">
        {icon}
      </div>
      <span className="text-[9px] sm:text-[10px] leading-tight text-center text-wedding-cream font-medium max-w-[72px]">
        {label}
      </span>
    </button>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-wedding-primary flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-wedding-cream rounded-2xl shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function ConfirmPage() {
  const { guestId } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixOpen, setPixOpen] = useState(false);

  useEffect(() => {
    const loadGuest = async () => {
      try {
        const guests = await getGuests();
        const foundGuest = guests.find((g) => g.id === guestId);

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
    if (!guest || submitting) return;

    setSubmitting(true);
    try {
      await updateGuestStatus(guest.id!, 'confirmed');
      setGuest({ ...guest, status: 'confirmed' });
      toast.success('Presença confirmada!');
    } catch (err) {
      setError('Erro ao confirmar presença');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!guest || submitting) return;

    setSubmitting(true);
    try {
      await updateGuestStatus(guest.id!, 'declined');
      setGuest({ ...guest, status: 'declined' });
      toast.success('Resposta registrada.');
    } catch (err) {
      setError('Erro ao recusar convite');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX.key);
    toast.success('Chave PIX copiada!');
  };

  if (loading) {
    return (
      <InviteShell>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-wedding-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Carregando convite...</p>
        </div>
      </InviteShell>
    );
  }

  if (error || !guest) {
    return (
      <InviteShell>
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Convidado não encontrado'}</p>
          <Button
            className="w-full bg-wedding-primary text-wedding-cream hover:bg-wedding-darkMarsala"
            onClick={() => navigate('/')}
          >
            Ir para o site do casamento
          </Button>
        </div>
      </InviteShell>
    );
  }

  return (
    <InviteShell>
      <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white ring-4 ring-wedding-primary/25 shadow-lg overflow-hidden mb-5">
          <img
            src="/logo1.png"
            alt="Bruno & Guilherme"
            className="w-full h-full object-cover"
          />
        </div>

        <p className="font-elegant italic text-sm text-wedding-primary/80 mb-2">
          Com a bênção de Deus
        </p>

        <h1 className="font-script text-5xl sm:text-6xl text-wedding-primary leading-tight mb-2">
          {WEDDING.coupleNames}
        </h1>

        <p className="font-elegant italic text-sm text-gray-600 mb-4">
          Convidam para a celebração de seu casamento.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-5 px-6 py-4">
        <div className="flex flex-col items-center border-y border-dotted border-wedding-primary/40 py-2 px-2 sm:px-3 min-w-[72px]">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-elegant text-wedding-primary">
            {WEDDING.month}
          </span>
        </div>

        <span className="text-6xl sm:text-7xl font-bold text-wedding-primary leading-none tabular-nums">
          {WEDDING.day}
        </span>

        <div className="flex flex-col items-center border-y border-dotted border-wedding-primary/40 py-2 px-2 sm:px-3 min-w-[72px] gap-0.5">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest font-elegant text-wedding-primary">
            {WEDDING.year}
          </span>
          <span className="text-[10px] sm:text-xs text-wedding-primary/80">{WEDDING.time}</span>
        </div>
      </div>

      <div className="text-center px-6 pb-6 space-y-1">
        <p className="font-elegant font-semibold text-wedding-primary text-base sm:text-lg">
          {WEDDING.venue}
        </p>
        <p className="font-elegant italic text-sm text-gray-600">{WEDDING.address}</p>
        <p className="font-elegant italic text-sm text-gray-600">{WEDDING.city}</p>
      </div>

      <div className="mx-4 mb-4 rounded-xl bg-wedding-secondary/60 border border-wedding-primary/15 p-4 sm:p-5">
        {guest.status === 'pending' ? (
          <>
            <p className="text-center text-sm text-wedding-primary font-medium mb-4">
              Olá, {guest.name.split(' ')[0]}! Podemos contar com a sua presença?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-wedding-accent text-wedding-cream hover:bg-wedding-accent/90"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Presença'}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-wedding-primary/30 text-wedding-primary hover:bg-wedding-primary/10"
                onClick={handleDecline}
                disabled={submitting}
              >
                Não Poderei Ir
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2">
            <p className="font-elegant font-semibold text-wedding-primary">
              {guest.status === 'confirmed' ? 'Presença Confirmada!' : 'Presença Declinada'}
            </p>
            <p className="text-sm text-gray-600">
              {guest.status === 'confirmed'
                ? 'Obrigado por confirmar! Estamos ansiosos para celebrar com você.'
                : 'Obrigado por nos informar. Sentiremos sua falta!'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-wedding-primary px-3 sm:px-4 py-5 sm:py-6">
        <div className="grid grid-cols-4 gap-1 sm:gap-2 max-w-sm mx-auto">
          <InviteIconButton
            icon={<MapPin className="w-5 h-5" />}
            label="Cerimônia"
            onClick={() => window.open(WEDDING.mapsUrl, '_blank')}
          />
          <InviteIconButton
            icon={<Wine className="w-5 h-5" />}
            label="Recepção"
            onClick={() => window.open(WEDDING.siteUrl, '_blank')}
          />
          <InviteIconButton
            icon={<Gift className="w-5 h-5" />}
            label="Lista de Presentes"
            onClick={() => window.open(WEDDING.giftsUrl, '_blank')}
          />
          <InviteIconButton
            icon={<QrCode className="w-5 h-5" />}
            label="Presentear por Pix"
            onClick={() => setPixOpen(true)}
          />
        </div>
        <p className="text-center text-[10px] sm:text-xs text-wedding-cream/70 mt-4">
          Clique nos ícones para acessar
        </p>
      </div>

      {guest.status !== 'pending' && (
        <div className="px-6 pb-6 pt-2">
          <Button
            variant="outline"
            className="w-full border-wedding-primary/30 text-wedding-primary hover:bg-wedding-primary/5"
            onClick={() => navigate('/')}
          >
            Conhecer o site do casamento
          </Button>
        </div>
      )}

      <Dialog open={pixOpen} onOpenChange={setPixOpen}>
        <DialogContent className="bg-wedding-cream border-wedding-primary/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-elegant text-wedding-primary text-center">
              Presentear por PIX
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-3 rounded-lg shadow">
              <img
                src="/Qrcode.png"
                alt="QR Code PIX"
                className="w-[180px] h-[180px] object-contain"
              />
            </div>
            <div className="w-full space-y-2 text-center text-sm">
              <div className="bg-wedding-secondary/50 rounded-lg p-3">
                <p className="font-semibold text-wedding-primary">Chave PIX</p>
                <p className="text-wedding-darkMarsala">{PIX.key}</p>
              </div>
              <div className="bg-wedding-secondary/50 rounded-lg p-3">
                <p className="font-semibold text-wedding-primary">Titular</p>
                <p className="text-wedding-darkMarsala text-xs sm:text-sm">{PIX.name}</p>
              </div>
            </div>
            <Button
              className="w-full bg-wedding-primary text-wedding-cream hover:bg-wedding-darkMarsala"
              onClick={copyPix}
            >
              Copiar Chave PIX
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </InviteShell>
  );
}
