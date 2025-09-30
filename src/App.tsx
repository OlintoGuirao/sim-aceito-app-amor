import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Index from './pages/Index';
import AdminPage from './pages/AdminPage';
import { ConfirmPage } from './pages/confirm';
import { SaveTheDatePage } from './pages/SaveTheDate';
import AdminRaffle from '@/pages/AdminRaffle';
import AdminLogin from './pages/AdminLogin';
import PadrinhoPage from './pages/PadrinhoPage';
import PartyGallery from '@/components/PartyGallery';
import { useAuth } from './lib/auth';

// Componente para rota protegida da rifa (permitir usuários autenticados)
const RaffleRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-50">Carregando...</div>
      </div>
    );
  }

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Permite acesso a qualquer usuário autenticado (admin ou padrinho)

  return <>{children}</>;
};

// Componente para rota protegida de padrinhos
const PadrinhoRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-50">Carregando...</div>
      </div>
    );
  }

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se for admin, redireciona para área de rifas
  if (isAdmin) {
    return <Navigate to="/raffle" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-50">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* ===== ROTAS PÚBLICAS ===== */}
        <Route path="/" element={<Index />} />
        <Route path="/confirm/:guestId" element={<ConfirmPage />} />
        <Route path="/save-the-date/:guestId" element={<SaveTheDatePage />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/party-gallery/:userId" element={<PartyGallery />} />

        {/* ===== ROTAS DA RIFA (ADMIN) ===== */}
        <Route path="/raffle" element={<AdminRaffle />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/raffle" element={<AdminRaffle />} />

        {/* ===== ROTAS DOS PADRINHOS ===== */}
        <Route path="/padrinhos" element={
          <PadrinhoRoute>
            <PadrinhoPage />
          </PadrinhoRoute>
        } />

        {/* ===== ROTA 404 ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
