import { useEffect } from 'react';
import { Modal, Button, Group, Badge } from '@mantine/core';
import {
  IconCheck,
  IconReceipt,
  IconPrinter,
  IconCash,
  IconCreditCard,
  IconBuildingBank,
  IconUser,
  IconClock,
  IconPackage,
} from '@tabler/icons-react';
import { formatearMoneda, formatearFechaHora } from '../../../utils/formateadores';
import { useVenta } from '../../../contexts/VentaContext';

export const ModalVentaExitosa = () => {
  const { modalExitoAbierto, setModalExitoAbierto, ultimaVentaRealizada } = useVenta();

  // Escuchar tecla Enter o Escape para cerrar y pasar a la siguiente venta
  useEffect(() => {
    const manejarTeclado = (e) => {
      if (modalExitoAbierto && (e.key === 'Enter' || e.key === 'Escape')) {
        e.preventDefault();
        setModalExitoAbierto(false);
      }
    };

    window.addEventListener('keydown', manejarTeclado);
    return () => window.removeEventListener('keydown', manejarTeclado);
  }, [modalExitoAbierto, setModalExitoAbierto]);

  if (!ultimaVentaRealizada) return null;

  const esEfectivo = ultimaVentaRealizada.pago.metodo === 'efectivo';
  const totalPagado = ultimaVentaRealizada.totales.total;
  const montoRecibido = ultimaVentaRealizada.pago.montoRecibido || totalPagado;
  const cambio = ultimaVentaRealizada.pago.cambio || 0;

  const obtenerIconoMetodo = () => {
    switch (ultimaVentaRealizada.pago.metodo) {
      case 'tarjeta':
        return <IconCreditCard size={16} />;
      case 'transferencia':
        return <IconBuildingBank size={16} />;
      default:
        return <IconCash size={16} />;
    }
  };

  const obtenerTextoMetodo = () => {
    switch (ultimaVentaRealizada.pago.metodo) {
      case 'tarjeta':
        return 'Pago con Tarjeta';
      case 'transferencia':
        return 'Transferencia Electrónica';
      default:
        return 'Pago en Efectivo';
    }
  };

  const manejarImprimir = () => {
    window.print();
  };

  return (
    <Modal
      opened={modalExitoAbierto}
      onClose={() => setModalExitoAbierto(false)}
      centered
      radius={24}
      size="md"
      withCloseButton={false}
      classNames={{
        content: '!rounded-3xl shadow-2xl overflow-hidden',
      }}
      overlayProps={{
        backgroundOpacity: 0.65,
        blur: 4,
      }}
    >
      <div className="flex flex-col items-center text-center p-2 select-none">
        {/* Icono de exito animado con efecto visual */}
        <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20 ring-8 ring-emerald-50">
          <IconCheck size={42} stroke={3} />
        </div>

        {/* Titulo y Folio */}
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          ¡Venta Exitosa!
        </h2>
        <div className="flex items-center gap-2 mt-1 mb-4">
          <Badge variant="filled" color="indigo" size="md" radius="sm">
            Folio: {ultimaVentaRealizada.id}
          </Badge>
          <Badge variant="light" color="gray" size="md" radius="sm">
            {obtenerTextoMetodo()}
          </Badge>
        </div>

        {/* Resumen de Cambio a Entregar (Si es efectivo) */}
        {esEfectivo && (
          <div className="w-full bg-linear-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/20 mb-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
              Cambio para el cliente
            </span>
            <span className="text-4xl font-black font-mono tracking-tight block mt-0.5">
              {formatearMoneda(cambio)}
            </span>
            <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-emerald-400/40 text-xs text-emerald-100 font-mono">
              <span>Recibido: {formatearMoneda(montoRecibido)}</span>
              <span>•</span>
              <span>Total: {formatearMoneda(totalPagado)}</span>
            </div>
          </div>
        )}

        {/* Si no es efectivo, tarjeta o transferencia */}
        {!esEfectivo && (
          <div className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-900/20 mb-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Total Cobrado
            </span>
            <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight block mt-0.5">
              {formatearMoneda(totalPagado)}
            </span>
            {ultimaVentaRealizada.pago.referencia && (
              <span className="text-xs text-slate-400 font-mono block mt-1">
                Ref / Auth: {ultimaVentaRealizada.pago.referencia}
              </span>
            )}
          </div>
        )}

        {/* Tarjeta de Detalles de la Transaccion */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-5 text-xs text-slate-600 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <IconUser size={15} className="text-slate-400" /> Cliente
            </span>
            <span className="font-bold text-slate-800">
              {ultimaVentaRealizada.cliente?.nombre || 'Público General'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <IconPackage size={15} className="text-slate-400" /> Artículos
            </span>
            <span className="font-bold text-slate-800 font-mono">
              {ultimaVentaRealizada.totales.totalArticulos} pza(s)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <IconClock size={15} className="text-slate-400" /> Fecha y Hora
            </span>
            <span className="font-medium text-slate-700">
              {formatearFechaHora(ultimaVentaRealizada.fecha)}
            </span>
          </div>
        </div>

        {/* Botones de Accion */}
        <Group justify="center" gap="sm" className="w-full">
          <Button
            variant="default"
            size="md"
            radius="xl"
            leftSection={<IconPrinter size={18} />}
            onClick={manejarImprimir}
            className="flex-1"
          >
            Imprimir Ticket
          </Button>

          <Button
            color="teal"
            size="md"
            radius="xl"
            onClick={() => setModalExitoAbierto(false)}
            className="flex-1 font-bold shadow-md shadow-teal-500/20"
          >
            Siguiente Venta [Enter]
          </Button>
        </Group>
      </div>
    </Modal>
  );
};
