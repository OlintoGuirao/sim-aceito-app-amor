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
      const userRole = await login(email, password);
      
      // Redireciona baseado no retorno do login
      if (userRole.isAdmin) {
        navigate('/raffle');
        toast.success('Bem-vindo, Administrador!');
      } else if (userRole.isPadrinho) {
        navigate('/padrinhos');
        toast.success('Bem-vindo, Padrinho!');
      } else {
        toast.error('Usuário não tem permissões adequadas');
      }

    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou senha incorretos. Por favor, verifique suas credenciais.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas de login. Por favor, tente novamente mais tarde.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wedding-marsala p-4">
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
                className="bg-wedding-secondary placeholder:text-transparent focus:placeholder:text-transparent"
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
                className="bg-wedding-secondary placeholder:text-transparent focus:placeholder:text-transparent"
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