import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, MessageCircle, Ticket } from 'lucide-react';
import { RAFFLE_ENABLED } from '@/lib/features';

interface NavigationMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  heroMode?: boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  activeSection,
  onSectionChange,
  heroMode = false,
}) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const menuItems = [
    { id: 'countdown', label: 'Contagem Regressiva', icon: '⏰' },
    { id: 'gallery', label: 'Nossa História', icon: '📖' },
    { id: 'location', label: 'Local', icon: '📍' },
    { id: 'party', label: 'Hora da Festa', icon: '🎉' },
    { id: 'messages', label: 'Recados', icon: '💌' },
    { id: 'manual', label: 'Manual dos Convidados', icon: '📋' },
    ...(RAFFLE_ENABLED ? [{ id: 'raffle', label: 'Rifa', icon: '🎫' }] : []),
    { id: 'gifts', label: 'Lista de Presentes', icon: '🎁' }
  ];

  const updateScrollHint = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollHint(el.scrollWidth - el.scrollLeft - el.clientWidth > 8);
  }, []);

  useEffect(() => {
    updateScrollHint();
    window.addEventListener('resize', updateScrollHint);
    return () => window.removeEventListener('resize', updateScrollHint);
  }, [updateScrollHint, menuItems.length]);

  const renderMenuItem = (item: (typeof menuItems)[number]) => {
    const isRaffle = item.id === 'raffle';
    const isActive = activeSection === item.id;
    const linkClass = `p-2.5 sm:p-3 rounded-lg text-center transition-all hover:scale-105 block shrink-0 grow-0 basis-[calc((100%-1rem)/3)] md:basis-auto md:w-full ${
      isActive
        ? 'bg-wedding-accent text-wedding-cream shadow-lg ring-1 ring-wedding-primary/30'
        : heroMode
          ? 'bg-white/20 hover:bg-white/30 border border-white/25 md:bg-white/50 md:hover:bg-wedding-secondary/80 md:border-0'
          : 'bg-white/50 hover:bg-wedding-secondary/80'
    }`;
    const labelClass = `text-[10px] sm:text-xs font-medium bg-transparent leading-tight ${
      isActive
        ? 'text-wedding-cream'
        : heroMode
          ? 'text-white md:text-black'
          : 'text-black'
    }`;

    if (isRaffle) {
      return (
        <Link
          key={item.id}
          to="/?section=raffle"
          className={linkClass}
          onClick={isHomePage ? () => onSectionChange('raffle') : undefined}
        >
          <div className="text-xl mb-1">{item.icon}</div>
          <div className={labelClass}>{item.label}</div>
        </Link>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => onSectionChange(item.id)}
        className={linkClass}
      >
        <div className="text-xl mb-1">{item.icon}</div>
        <div className={labelClass}>{item.label}</div>
      </button>
    );
  };

  return (
    <Card
      className={`p-4 mb-8 glass-effect ${
        heroMode
          ? 'bg-black/30 backdrop-blur-sm border border-white/15 md:bg-wedding-palha/20 md:border-transparent'
          : 'bg-wedding-palha/20'
      }`}
    >
      <div className="relative md:static">
        {showScrollHint && (
          <ChevronRight
            className="pointer-events-none absolute right-0 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-wedding-cream drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] md:hidden"
            aria-hidden
          />
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollHint}
          className={`flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible md:pb-0 ${RAFFLE_ENABLED ? 'lg:grid-cols-8' : 'lg:grid-cols-7'}`}
        >
          {menuItems.map(renderMenuItem)}
        </div>
      </div>

      {isAdmin && !isHomePage && (
        <div className="flex gap-2 mt-4 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/messages')}
            className="text-black bg-wedding-secondary hover:bg-wedding-gold"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Gerenciar Recados
          </Button>
          {RAFFLE_ENABLED && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/raffle')}
              className="text-black bg-wedding-secondary hover:bg-wedding-gold"
            >
              <Ticket className="w-4 h-4 mr-2" />
              Gerenciar Rifa
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default NavigationMenu;