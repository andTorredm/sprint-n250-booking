import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import PollDetailPage from '@/pages/PollDetailPage';
import CreatePollPage from '@/pages/CreatePollPage';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Caricamento...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/polls/:id" element={user ? <Layout><PollDetailPage /></Layout> : <Navigate to="/login" />} />
        <Route
          path="/admin/create-poll"
          element={user?.role === 'ADMIN' ? <Layout><CreatePollPage /></Layout> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
