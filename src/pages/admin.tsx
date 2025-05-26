import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AdminGuestManager from '@/components/AdminGuestManager';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Aqui você pode implementar uma verificação mais segura
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5e6d3]/10">
        <Card className="w-full max-w-md p-6 bg-white shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#5f161c]">Área Administrativa</h1>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#5f161c]/20 focus:border-[#5f161c] focus:ring-[#5f161c]/20"
            />
            <Button 
              onClick={handleLogin}
              className="w-full bg-[#f5e6d3] hover:bg-[#5f161c] text-[#5f161c] hover:text-white transition-colors"
            >
              Entrar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 bg-[#f5e6d3]/10 min-h-screen">
      <AdminGuestManager />
    </div>
  );
} 