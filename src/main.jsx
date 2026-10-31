import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// --- Console greeting for visitors ---
if (typeof window !== 'undefined') {
  console.log(
    '%c IMRAN IMRAN %c PORTFOLIO %c',
    'background: #111; color: #fff; padding: 5px 10px; font-weight: bold; border-radius: 3px 0 0 3px;',
    'background: #f33; color: #fff; padding: 5px 10px; font-weight: bold; border-radius: 0 3px 3px 0;',
    'background: transparent'
  );
  console.log(
    '%cHi Jury! %cWelcome to my portfolio. Thanks for exploring! 🚀',
    'font-weight: bold; color: #f33; font-size: 14px;',
    'color: #666; font-size: 14px;'
  );
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
