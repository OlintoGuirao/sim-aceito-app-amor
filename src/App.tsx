import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import AdminPage from './pages/admin';
import { ConfirmPage } from './pages/confirm';
import AdminRaffle from './pages/AdminRaffle';
import AdminLogin from './pages/AdminLogin';
import PadrinhoPage from './pages/PadrinhoPage';
import { useAuth } from './lib/auth';

// Componente para rota protegida da rifa
const RaffleRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isPadrinho, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-50">Carregando...</div>
      </div>
    );
  }

  // Se não estiver logado, redireciona para login da rifa
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se for padrinho, redireciona para área de padrinhos
  if (isPadrinho) {
    return <Navigate to="/padrinhos" replace />;
  }

  return <>{children}</>;
};

// Componente para rota protegida de padrinhos
const PadrinhoRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isPadrinho, loading } = useAuth();

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

  // Se não for padrinho, redireciona para rifa
  if (!isPadrinho) {
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
      <Routes>
        {/* ===== ROTAS PÚBLICAS ===== */}
        <Route path="/" element={<Index />} />
        <Route path="/confirm/:guestId" element={<ConfirmPage />} />

        {/* ===== ROTAS DA RIFA ===== */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/raffle" element={
          <RaffleRoute>
            <AdminRaffle />
          </RaffleRoute>
        } />

        {/* ===== ROTA DE GERENCIAMENTO DE CONVIDADOS ===== */}
        <Route path="/admin" element={<AdminPage />} />

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
