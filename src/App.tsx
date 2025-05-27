import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import AdminPage from './pages/admin';
import { ConfirmPage } from './pages/confirm';
import AdminRaffle from './pages/AdminRaffle';
import AdminLogin from './pages/AdminLogin';
import { useAuth } from './lib/auth';

function App() {
  const { isAdmin, loading } = useAuth();

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
        <Route path="/" element={<Index />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            isAdmin ? (
              <Navigate to="/admin/raffle" replace />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } 
        />
        <Route path="/confirm/:guestId" element={<ConfirmPage />} />
        <Route 
          path="/admin/raffle" 
          element={
            isAdmin ? (
              <AdminRaffle />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
