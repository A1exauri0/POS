import { useState, useEffect, useMemo } from 'react';
import { Button, Tooltip, Badge, Popover, TextInput, ActionIcon } from '@mantine/core';
import {
  IconReceipt,
  IconTrash,
  IconUser,
  IconCashBanknote,
  IconShoppingCartOff,
  IconSearch,
  IconChevronDown,
  IconCheck,
  IconX,
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
  const [popoverAbierto, setPopoverAbierto] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');

  // Refrescar lista de clientes al interactuar con el dropdown
  const refrescarClientes = () => {
    setListaClientes(obtenerClientes());
  };

  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente.trim()) return listaClientes;
    const normalizado = busquedaCliente.toLowerCase().trim();
    return listaClientes.filter((c) => c.nombre.toLowerCase().includes(normalizado));
  }, [listaClientes, busquedaCliente]);

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

        {/* Dropdown de Cliente: Boton limpio con Buscador en el menu de opciones */}
        <div>
          <Popover
            opened={popoverAbierto}
            onChange={setPopoverAbierto}
            position="bottom-start"
            width="target"
            shadow="lg"
            radius={16}
            classNames={{
              dropdown: '!rounded-2xl border border-slate-200 p-2 shadow-2xl bg-white',
            }}
          >
            <Popover.Target>
              <button
                type="button"
                onClick={() => {
                  refrescarClientes();
                  setPopoverAbierto((prev) => !prev);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-100 transition-all cursor-pointer text-xs focus:outline-hidden focus:border-indigo-500"
              >
                <div className="flex items-center gap-2 truncate">
                  <IconUser size={15} className="text-indigo-400 shrink-0" />
                  <span className="font-semibold truncate">
                    {cliente?.nombre || 'Público General'}
                  </span>
                </div>
                <IconChevronDown size={14} className="text-slate-400 shrink-0 ml-1.5" />
              </button>
            </Popover.Target>

            <Popover.Dropdown>
              {/* Buscador dentro del menu de opciones */}
              <div className="p-1 pb-2">
                <TextInput
                  placeholder="Buscar cliente..."
                  size="xs"
                  radius="lg"
                  leftSection={<IconSearch size={14} className="text-slate-400" />}
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  autoFocus
                  rightSection={
                    busquedaCliente ? (
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={() => setBusquedaCliente('')}
                      >
                        <IconX size={12} />
                      </ActionIcon>
                    ) : null
                  }
                />
              </div>

              {/* Lista de Clientes (Solo nombres, sin telefonos) */}
              <div className="max-h-52 overflow-y-auto space-y-0.5">
                {clientesFiltrados.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No se encontró el cliente
                  </div>
                ) : (
                  clientesFiltrados.map((cli) => {
                    const esSeleccionado = (cliente?.id || 'cli-1') === cli.id;
                    const esDefault = cli.esPredeterminado || cli.id === 'cli-1';

                    return (
                      <button
                        key={cli.id}
                        type="button"
                        onClick={() => {
                          setCliente(cli);
                          setPopoverAbierto(false);
                          setBusquedaCliente('');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          esSeleccionado
                            ? 'bg-indigo-50 text-indigo-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <span className="truncate">{cli.nombre}</span>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {esSeleccionado && (
                            <IconCheck size={14} className="text-indigo-600" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Popover.Dropdown>
          </Popover>
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
