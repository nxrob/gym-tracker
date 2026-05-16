import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--accent)',
          color: '#000',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'var(--text-base)',
          letterSpacing: '.05em',
          textTransform: 'uppercase',
          borderRadius: 'var(--r-pill)',
          border: 'none',
        },
      }}
    />
  </React.StrictMode>
);
