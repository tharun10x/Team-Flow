import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { WorkspaceProvider } from './context/WorkspaceContext.tsx'
import { ChannelProvider } from './context/ChannelContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WorkspaceProvider>
        <ChannelProvider>
        <App />
        </ChannelProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </StrictMode>,
)
