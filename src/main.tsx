import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletProvider } from '@razorlabs/razorkit';

// Import CSS in correct order: Tailwind first, then other styles
import './index.css'
import '@razorlabs/razorkit/style.css';
import '@mosaicag/swap-widget/style.css';

import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
   
      <WalletProvider>
        <App />
      </WalletProvider>
   
  </StrictMode>,
)