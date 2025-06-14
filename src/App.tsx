import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Index from './pages/Index';
import AdminPage from './pages/admin';
import { ConfirmPage } from './pages/confirm';
import AdminRaffle from '@/pages/AdminRaffle';
import AdminLogin from './pages/AdminLogin';
import PadrinhoPage from './pages/PadrinhoPage';
import PartyGallery from '@/components/PartyGallery';
import { useAuth } from './lib/auth';

// Componente para rota protegida da rifa (admin)
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

  // Se não for admin, redireciona para área de padrinhos
  if (!isAdmin) {
    return <Navigate to="/padrinhos" replace />;
  }

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
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/party-gallery/:userId" element={<PartyGallery />} />

        {/* ===== ROTAS DA RIFA (ADMIN) ===== */}
        <Route path="/raffle" element={
          <RaffleRoute>
            <AdminRaffle />
          </RaffleRoute>
        } />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/raffle" element={
          <RaffleRoute>
            <AdminRaffle />
          </RaffleRoute>
        } />

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
