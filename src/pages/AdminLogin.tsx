import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Crown } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/admin/raffle');
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-wedding-accent/20 to-wedding-blush/20">
      <Card className="w-full max-w-md p-6 bg-wedding-primary">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-wedding-gold" />
            <h1 className="text-2xl font-elegant font-semibold text-slate-50">
              Área Administrativa
            </h1>
          </div>
          <p className="text-slate-50/70">
            Faça login para acessar a área administrativa
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-wedding-secondary text-black placeholder:text-black/60"
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-wedding-secondary text-black placeholder:text-black/60"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin; 