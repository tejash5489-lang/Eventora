import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { UIProvider } from './context/UIContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UIProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </UIProvider>
  </StrictMode>,
)
