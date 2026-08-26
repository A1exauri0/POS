import { createTheme } from '@mantine/core';

// Configuracion del tema visual de Mantine para el sistema POS
export const temaMantine = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSizes: {
    xs: '0.825rem',
    sm: '0.925rem',
    md: '1.05rem',
    lg: '1.2rem',
    xl: '1.35rem',
  },
  colors: {
    // Paleta personalizada para botones de cobro y acciones destacadas
    posVerde: [
      '#ebfbee',
      '#d3f9d8',
      '#b2f2bb',
      '#8ce99a',
      '#69db7c',
      '#51cf66',
      '#40c057',
      '#37b24d',
      '#2f9e44',
      '#2b8a3e',
    ],
  },
});
