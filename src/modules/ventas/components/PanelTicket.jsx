import { Button, Tooltip, Badge } from '@mantine/core';
import {
  IconReceipt,
  IconTrash,
  IconUser,
  IconCashBanknote,
  IconShoppingCartOff,
} from '@tabler/icons-react';
import { ItemTicket } from './ItemTicket';
import { formatearMoneda } from '../../../utils/formateadores';
import { useVenta } from '../../../contexts/VentaContext';

export const PanelTicket = () => {
  const {
    articulos,
    cliente,
    setCliente,
    totales,
    limpiarVenta,
    setModalCobroAbierto,
  } = useVenta();

  const cambiarClientePrompt = () => {
    const nuevoNombre = window.prompt('Nombre del cliente para la nota/ticket:', cliente.nombre);
    if (nuevoNombre && nuevoNombre.trim()) {
      setCliente((prev) => ({ ...prev, nombre: nuevoNombre.trim() }));
    }
  };

  const hayArticulos = articulos.length > 0;

  return (
    <div className="w-80 md:w-96 bg-slate-900 text-white flex flex-col h-full border-l border-slate-800 shadow-xl select-none shrink-0">
      {/* Cabecera del Ticket y Cliente */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <IconReceipt size={20} className="text-indigo-400" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              Ticket de Venta
            </h2>
          </div>
          <Badge color="indigo" variant="filled" size="sm">
            {totales.totalArticulos} {totales.totalArticulos === 1 ? 'artículo' : 'artículos'}
          </Badge>
        </div>

        {/* Barra de Cliente */}
        <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/80">
          <div className="flex items-center gap-2 overflow-hidden">
            <IconUser size={15} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium truncate">
              {cliente.nombre}
            </span>
          </div>
          <button
            type="button"
            onClick={cambiarClientePrompt}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer shrink-0"
          >
            Cambiar
          </button>
        </div>
      </div>

      {/* Lista de Articulos en el Ticket */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-950/40">
        {hayArticulos ? (
          articulos.map((item) => <ItemTicket key={item.id} item={item} />)
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <IconShoppingCartOff size={42} stroke={1.5} className="text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">El ticket está vacío</p>
            <p className="text-xs text-slate-600 mt-1">
              Escanea un código o haz clic en los productos para agregarlos
            </p>
          </div>
        )}
      </div>

      {/* Resumen de Totales y Boton de Cobro */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-3">
        {/* Desglose de Precios */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono">{formatearMoneda(totales.subtotal)}</span>
          </div>

          {totales.descuento > 0 && (
            <div className="flex justify-between text-rose-400 font-medium">
              <span>Descuento aplicado:</span>
              <span className="font-mono">-{formatearMoneda(totales.descuento)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>IVA incluido (16%):</span>
            <span className="font-mono">{formatearMoneda(totales.impuestos)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Total a Pagar</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatearMoneda(totales.total)}
            </span>
          </div>
        </div>

        {/* Botones de Accion */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <Tooltip label="Vaciar ticket actual (F9)" withArrow>
            <Button
              color="gray"
              variant="light"
              disabled={!hayArticulos}
              onClick={limpiarVenta}
              className="col-span-1"
              size="md"
            >
              <IconTrash size={18} />
            </Button>
          </Tooltip>

          <Button
            color="teal"
            variant="filled"
            disabled={!hayArticulos}
            onClick={() => setModalCobroAbierto(true)}
            className="col-span-3 font-bold text-base shadow-lg shadow-teal-900/30"
            size="md"
            leftSection={<IconCashBanknote size={20} />}
          >
            COBRAR (F2)
          </Button>
        </div>
      </div>
    </div>
  );
};
