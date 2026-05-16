import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { Toaster } from 'react-hot-toast';

import App from './App.jsx';

import './styles/main.css';


createRoot(
  document.getElementById('root')
).render(

  <StrictMode>

    <Toaster

      position="top-right"

      toastOptions={{

        duration: 3000,

        style: {

          background: '#1e293b',

          color: '#fff',

          borderRadius: '10px',

          padding: '14px 18px',

          fontSize: '14px'

        }

      }}

    />

    <App />

  </StrictMode>

);