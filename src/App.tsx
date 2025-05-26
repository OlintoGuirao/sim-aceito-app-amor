import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AdminPage from './pages/admin';
import { ConfirmPage } from './pages/confirm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/confirm/:guestId" element={<ConfirmPage />} />
      </Routes>
    </Router>
  );
}

export default App;
