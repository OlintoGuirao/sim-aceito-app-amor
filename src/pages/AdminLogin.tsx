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
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.code === 'auth/invalid-credential') {
        toast.error('Email ou senha incorretos');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#f5e6d3]/20 to-[#5f161c]/20 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-wedding-primary" />
              <h1 className="text-2xl font-elegant font-semibold">Área Administrativa</h1>
            </div>
            <p className="text-gray-600">
              Faça login para acessar a área administrativa
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-wedding-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-wedding-secondary"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-wedding-primary text-white hover:bg-wedding-primary/90"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin; 