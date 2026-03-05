import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import TitlePage from './pages/TitlePage';
import WatchlistPage from './pages/WatchlistPage';
import ListDetailPage from './pages/ListDetailPage';
import ListsPage from './pages/ListsPage';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import SubmitTitlePage from './pages/SubmitTitlePage';
import EditTitlePage from './pages/EditTitlePage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/profile" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/titles/:id" element={<TitlePage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/lists/:id" element={<ListDetailPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/lists/:listId" element={<ListDetailPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitTitlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/titles/:id/edit"
            element={
              <ProtectedRoute>
                <EditTitlePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

