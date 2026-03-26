import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute   from './components/auth/ProtectedRoute'
import LoginView        from './views/LoginView'
import MainView         from './views/MainView'
import AtomShowcase     from './AtomShowcase'
import MoleculeShowcase from './MoleculeShowcase'
import ChatView         from './views/ChatView'

function App() {
  return (
    <AuthProvider>
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
          <Route path="/chat" element={<ChatView />} />
          <Route path="/atoms" element={<AtomShowcase />} />
          <Route path="/molecules" element={<MoleculeShowcase />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
