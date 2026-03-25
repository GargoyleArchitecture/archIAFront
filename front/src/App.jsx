import { useState } from 'react'
import AtomShowcase     from './AtomShowcase'
import MoleculeShowcase from './MoleculeShowcase'
import ChatView from './views/ChatView'

function App() {
  const [view, setView] = useState('atoms')

  if (view === 'molecules') {
    return <MoleculeShowcase onNavigate={setView} />
  }
  if (view === 'demo') {
    return <ChatView onNavigate={setView} />
  }

  return <AtomShowcase onNavigate={setView} />
}

export default App
