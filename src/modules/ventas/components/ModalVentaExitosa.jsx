import { useState, useEffect } from 'react';
import { Modal, Button, Group, Badge, Collapse } from '@mantine/core';
import {
  IconCheck,
  IconPrinter,
} from '@tab  ler/icons-react';
import { formatearMoneda } from '../../../utils/formateadores';
import { useVenta } from '../../../contexts/VentaContext';
import { TicketImpresion } from './TicketImpresion';

export const ModalVentaExitosa = () => {
  const { modalExitoAbierto, setModalExitoAbierto, ultimaVentaRealizada } = useVenta();
  const [mostrarVistaPrevia] = useState(false);

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

  const obtenerTextoMetodo = () => {
    switch (ultimaVentaRealizada.pago.metodo) {
      case 'tarjeta':
        return 'Pago con Tarjeta';
      case 'transferencia':
        return 'Transferencia';
      default:
        return 'Pago en Efectivo';
    }
  };

  const manejarImprimir = () => {
    window.print();
  };

  return (
    <>
      {/* Elemento dedicado para la impresion física (visible unicamente en @media print) */}
      <div className="hidden print:block">
        <TicketImpresion venta={ultimaVentaRealizada} />
      </div>

      <Modal
        opened={modalExitoAbierto}
        onClose={() => setModalExitoAbierto(false)}
        centered
        radius={24}
        size="md"
        withCloseButton={false}
        classNames={{
          content: '!rounded-3xl shadow-2xl overflow-hidden border border-slate-100',
          body: 'p-5',
        }}
        overlayProps={{
          backgroundOpacity: 0.6,
          blur: 4,
        }}
      >
        <div className="flex flex-col items-center text-center select-none space-y-3.5">
          {/* Icono de exito con estilo limpio */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs ring-6 ring-emerald-50/50">
            <IconCheck size={36} stroke={2.5} />
          </div>

          {/* Titulo y Folio */}
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              ¡Venta Completada!
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge variant="filled" color="indigo" size="sm" radius="sm">
                Folio: {ultimaVentaRealizada.id}
              </Badge>
              <Badge variant="light" color="gray" size="sm" radius="sm">
                {obtenerTextoMetodo()}
              </Badge>
            </div>
          </div>

          {/* Resumen de Cambio (Si es efectivo) */}
          {esEfectivo && (
            <div className="w-full bg-emerald-50/90 border border-emerald-200 text-emerald-950 p-3.5 rounded-2xl shadow-2xs text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                Cambio para el cliente
              </span>
              <span className="text-3xl font-black font-mono tracking-tight block text-emerald-700 mt-0.5">
                {formatearMoneda(cambio)}
              </span>
              <div className="flex items-center justify-center gap-3 mt-1.5 pt-1.5 border-t border-emerald-200/80 text-[11px] text-emerald-800 font-mono">
                <span>Recibido: <strong>{formatearMoneda(montoRecibido)}</strong></span>
                <span>•</span>
                <span>Total: <strong>{formatearMoneda(totalPagado)}</strong></span>
              </div>
            </div>
          )}

          {/* Si es Tarjeta o Transferencia */}
          {!esEfectivo && (
            <div className="w-full bg-indigo-50/70 border border-indigo-100 text-indigo-950 p-3.5 rounded-2xl shadow-2xs text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                Total Cobrado
              </span>
              <span className="text-3xl font-black font-mono tracking-tight block text-slate-900 mt-0.5">
                {formatearMoneda(totalPagado)}
              </span>
              {ultimaVentaRealizada.pago.referencia && (
                <span className="text-xs text-indigo-700 font-mono font-bold block mt-1">
                  Ref / Auth: {ultimaVentaRealizada.pago.referencia}
                </span>
              )}
            </div>
          )}


          {/* Vista previa colapsable del ticket */}
          <Collapse in={mostrarVistaPrevia} className="w-full">
            <div className="max-h-64 overflow-y-auto rounded-xl p-1 bg-slate-50 border border-slate-200">
              <TicketImpresion venta={ultimaVentaRealizada} />
            </div>
          </Collapse>

          {/* Botones de Accion */}
          <Group justify="center" gap="sm" className="w-full pt-1">
            <Button
              variant="default"
              size="md"
              radius="xl"
              leftSection={<IconPrinter size={18} />}
              onClick={manejarImprimir}
              className="flex-1 font-semibold"
            >
              Imprimir Ticket
            </Button>

            <Button
              color="teal"
              size="md"
              radius="xl"
              onClick={() => setModalExitoAbierto(false)}
              className="flex-1 font-extrabold shadow-md shadow-teal-600/20"
            >
              Aceptar
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
};

