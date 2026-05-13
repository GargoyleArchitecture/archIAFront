import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ModeProvider } from './contexts/ModeContext'
import { FeaturesProvider } from './contexts/FeaturesContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import ProtectedRoute   from './components/auth/ProtectedRoute'
import LoginView         from './views/LoginView'
import AppLayout         from './components/templates/AppLayout'
import ChatHomePanel     from './components/templates/ChatHomePanel'
import ProjectsView      from './views/ProjectsView'
import ProjectDetailView from './views/ProjectDetailView'
import ProfileView       from './views/ProfileView'
import AtomShowcase      from './AtomShowcase'
import MoleculeShowcase  from './MoleculeShowcase'
import ChatView          from './views/ChatView'
import ProfileView       from './views/ProfileView'
import ToastListener     from './components/atoms/ToastListener'

/**
 * F6-T5: monta el hook global de atajos de teclado dentro de
 * <ModeProvider> (necesario porque el hook usa useMode()).
 * No renderiza nada visual.
 */
function GlobalShortcutsLayer() {
  useKeyboardShortcuts()
  return null
}

function App() {
  return (
    <AuthProvider>
      <FeaturesProvider>
        <ModeProvider>
          <GlobalShortcutsLayer />
          <ToastListener />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginView />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:projectId"
                element={
                  <ProtectedRoute>
                    <ProjectDetailView />
                  </ProtectedRoute>
                }
              />
              <Route path="/chat" element={<ChatView />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileView />
                  </ProtectedRoute>
                }
              />
              <Route path="/atoms" element={<AtomShowcase />} />
              <Route path="/molecules" element={<MoleculeShowcase />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ModeProvider>
      </FeaturesProvider>
    </AuthProvider>
  )
}

export default App
