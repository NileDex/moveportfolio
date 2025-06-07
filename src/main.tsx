import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletProvider } from '@razorlabs/razorkit';
import '@razorlabs/razorkit/style.css';
import '@mosaicag/swap-widget/style.css';
import './index.css'
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
   
      <WalletProvider>
        <App />
      </WalletProvider>
   
  </StrictMode>,
)