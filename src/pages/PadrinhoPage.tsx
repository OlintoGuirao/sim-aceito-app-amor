import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Crown, Users, Gift, Calendar } from 'lucide-react';

const PadrinhoPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="p-6 bg-wedding-primary">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-wedding-gold" />
            <h1 className="text-2xl font-elegant font-semibold text-slate-50">
              Área do Padrinho
            </h1>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-white hover:bg-wedding-secondary"
          >
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-wedding-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-wedding-gold" />
              <h3 className="text-lg font-semibold text-slate-50">Lista de Convidados</h3>
            </div>
            <p className="text-slate-50/70 mb-4">
              Visualize e gerencie os convidados da sua lista
            </p>
            <Button 
              className="w-full bg-wedding-secondary text-black hover:bg-wedding-gold"
              onClick={() => navigate('/admin/guests')}
            >
              Ver Lista
            </Button>
          </Card>

          <Card className="p-4 bg-wedding-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-wedding-gold" />
              <h3 className="text-lg font-semibold text-slate-50">Lista de Presentes</h3>
            </div>
            <p className="text-slate-50/70 mb-4">
              Acompanhe os presentes escolhidos pelos convidados
            </p>
            <Button 
              className="w-full bg-wedding-secondary text-black hover:bg-wedding-gold"
              onClick={() => navigate('/admin/gifts')}
            >
              Ver Presentes
            </Button>
          </Card>

          <Card className="p-4 bg-wedding-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-wedding-gold" />
              <h3 className="text-lg font-semibold text-slate-50">Cronograma</h3>
            </div>
            <p className="text-slate-50/70 mb-4">
              Acompanhe as tarefas e prazos importantes
            </p>
            <Button 
              className="w-full bg-wedding-secondary text-black hover:bg-wedding-gold"
              onClick={() => navigate('/admin/schedule')}
            >
              Ver Cronograma
            </Button>
          </Card>

          <Card className="p-4 bg-wedding-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-wedding-gold" />
              <h3 className="text-lg font-semibold text-slate-50">Informações do Casamento</h3>
            </div>
            <p className="text-slate-50/70 mb-4">
              Acesse todas as informações importantes do casamento
            </p>
            <Button 
              className="w-full bg-wedding-secondary text-black hover:bg-wedding-gold"
              onClick={() => navigate('/admin/info')}
            >
              Ver Informações
            </Button>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default PadrinhoPage; 