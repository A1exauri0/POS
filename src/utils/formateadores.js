// Utilidades de formato para precios, monedas y fechas

export const formatearMoneda = (cantidad) => {
  const valorNumerico = typeof cantidad === 'number' ? cantidad : parseFloat(cantidad) || 0;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valorNumerico);
};

export const formatearFechaHora = (fecha = new Date()) => {
  const objetoFecha = typeof fecha === 'string' || typeof fecha === 'number' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(objetoFecha);
};

export const formatearHora = (fecha = new Date()) => {
  const objetoFecha = typeof fecha === 'string' || typeof fecha === 'number' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(objetoFecha);
};
