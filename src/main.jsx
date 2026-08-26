import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { temaMantine } from './styles/temaMantine';
import { VentaProvider } from './contexts/VentaContext';
import { CajaProvider } from './contexts/CajaContext';
import App from './App.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={temaMantine}>
      <Notifications position="top-right" zIndex={1000} />
      <CajaProvider>
        <VentaProvider>
          <App />
        </VentaProvider>
      </CajaProvider>
    </MantineProvider>
  </StrictMode>
);
