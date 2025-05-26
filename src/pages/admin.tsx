import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminGuestManager } from '@/components/AdminGuestManager';
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
    return <div style={{
      backgroundColor: 'rgb(95 22 28 / var(--tw-bg-opacity, 1))'
    }} className="min-h-screen flex items-center justify-center bg-wedding-secondary">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-wedding-primary">
            <CardTitle className="text-center text-wedding-secondary">Área Administrativa</CardTitle>
          </CardHeader>
          <CardContent className="bg-wedding-primary">
            <div className="space-y-4">
              <Input type="password" placeholder="Digite a senha" value={password} onChange={e => setPassword(e.target.value)} className="bg-wedding-secondary" />
              <Button onClick={handleLogin} className="w-full bg-wedding-secondary text-black">
                Entrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <AdminGuestManager />;
}