import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MessageCircle, Ticket } from 'lucide-react';

interface NavigationMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  activeSection,
  onSectionChange
}) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const menuItems = [
    { id: 'countdown', label: 'Contagem Regressiva', icon: '⏰' },
    { id: 'gallery', label: 'Nossa História', icon: '📖' },
    { id: 'location', label: 'Local', icon: '📍' },
    { id: 'party', label: 'Hora da Festa', icon: '🎉' },
    { id: 'messages', label: 'Recados', icon: '💌' },
    { id: 'manual', label: 'Manual dos Convidados', icon: '📋' },
    { id: 'raffle', label: 'Rifa', icon: '🎫' },
    { id: 'gifts', label: 'Lista de Presentes', icon: '🎁' }
  ];

  return (
    <Card className="p-4 mb-8 glass-effect bg-wedding-palha/20">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {menuItems.map(item => {
          const isRaffle = item.id === 'raffle';
          const linkClass = `p-3 rounded-lg text-center transition-all hover:scale-105 block w-full ${
            activeSection === item.id
              ? 'bg-wedding-marsala text-wedding-cream shadow-lg'
              : 'bg-white/50 hover:bg-wedding-secondary/60'
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
                <div className="text-black text-xs font-medium bg-transparent">{item.label}</div>
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
              <div className="text-black text-xs font-medium bg-transparent">{item.label}</div>
            </button>
          );
        })}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/raffle')}
            className="text-black bg-wedding-secondary hover:bg-wedding-gold"
          >
            <Ticket className="w-4 h-4 mr-2" />
            Gerenciar Rifa
          </Button>
        </div>
      )}
    </Card>
  );
};

export default NavigationMenu;