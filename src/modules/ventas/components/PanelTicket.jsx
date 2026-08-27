import { useState, useEffect } from 'react';
import { Button, Tooltip, Badge, Select } from '@mantine/core';
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
import { obtenerClientes } from '../../../services/clienteServicio';

export const PanelTicket = () => {
  const {
    articulos,
    cliente,
    setCliente,
    totales,
    limpiarVenta,
    setModalCobroAbierto,
  } = useVenta();

  const [listaClientes, setListaClientes] = useState(() => obtenerClientes());

  // Refrescar lista de clientes al interactuar con el dropdown
  const refrescarClientes = () => {
    setListaClientes(obtenerClientes());
  };

  const hayArticulos = articulos.length > 0;

  return (
    <div className="w-96 lg:w-[410px] xl:w-[430px] bg-slate-900 text-white flex flex-col h-full border-l border-slate-800 shadow-xl select-none shrink-0">
      {/* Cabecera del Ticket y Dropdown de Cliente con Buscador */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 space-y-2.5">
        <div className="flex items-center justify-between">
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

        {/* Dropdown con Buscador para seleccionar Cliente (Publico General por default) */}
        <div>
          <Select
            searchable
            clearable={false}
            size="xs"
            leftSection={<IconUser size={15} className="text-indigo-400" />}
            placeholder="Buscar cliente..."
            value={cliente?.id || 'cli-1'}
            data={listaClientes.map((c) => ({
              value: c.id,
              label: c.telefono && c.telefono !== 'Sin teléfono'
                ? `${c.nombre} (${c.telefono})`
                : c.nombre,
            }))}
            onChange={(idSeleccionado) => {
              const encontrado = listaClientes.find((c) => c.id === idSeleccionado);
              if (encontrado) setCliente(encontrado);
            }}
            onDropdownOpen={refrescarClientes}
            nothingFoundMessage="No se encontró el cliente"
            renderOption={({ option }) => {
              const cli = listaClientes.find((c) => c.id === option.value);
              const esDefault = cli?.esPredeterminado || cli?.id === 'cli-1';
              return (
                <div className="py-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-800 truncate">
                      {cli?.nombre}
                    </span>
                    {esDefault && (
                      <Badge color="dark" size="xs" variant="filled">
                        Default
                      </Badge>
                    )}
                  </div>
                  {cli?.telefono && cli?.telefono !== 'Sin teléfono' && (
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {cli.telefono}
                    </div>
                  )}
                </div>
              );
            }}
            classNames={{
              input:
                'bg-slate-800/90 border-slate-700 text-slate-100 font-medium text-xs rounded-lg focus:border-indigo-500',
              dropdown: 'bg-white border-slate-200 shadow-xl rounded-xl',
              option: 'hover:bg-slate-50 transition-colors',
            }}
          />
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
        {/* Desglose de Precios (Sin descuentos) */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono">{formatearMoneda(totales.subtotal)}</span>
          </div>

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
              color="red"
              variant="filled"
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
