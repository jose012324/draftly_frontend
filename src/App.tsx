import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ToastViewport } from './components/ui/ToastViewport';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardPage } from './pages/Dashboard';
import { EditorPage } from './pages/EditorPage';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { MyDocumentsPage } from './pages/MyDocuments';
import { NotFoundPage } from './pages/NotFound';
import { RecentPage } from './pages/Recent';
import { RegisterPage } from './pages/Register';
import { SharedDocumentsPage } from './pages/SharedDocuments';
import { TrashPage } from './pages/Trash';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Workspace */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/app" element={<DashboardPage />} />
              <Route path="/app/my-documents" element={<MyDocumentsPage />} />
              <Route path="/app/shared-with-me" element={<SharedDocumentsPage />} />
              <Route path="/app/recent" element={<RecentPage />} />
              <Route path="/app/trash" element={<TrashPage />} />
            </Route>

            <Route
              path="/documents/:id"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>

        <ToastViewport />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
