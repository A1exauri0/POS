import { useState, useMemo, useEffect } from 'react';
import { Table, Badge, Button, Modal, Pagination, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import {
  IconChartBar,
  IconReceipt,
  IconEye,
  IconCreditCard,
  IconCash,
  IconBuildingBank,
  IconX,
  IconCalendarEvent,
  IconPaperclip,
  IconFileText,
  IconExternalLink,
  IconPrinter,
} from '@tabler/icons-react';
import { useVenta } from '../../contexts/VentaContext';
import { formatearMoneda, formatearFechaHora } from '../../utils/formateadores';
import { TicketImpresion } from '../ventas/components/TicketImpresion';

export const PantallaReportes = () => {
  const { historialVentas } = useVenta();
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [comprobanteZoom, setComprobanteZoom] = useState(null);

  // Estados de filtrado por fecha
  const [filtroRapido, setFiltroRapido] = useState('todas'); // 'todas' | 'hoy' | '7dias' | 'mes' | 'personalizado'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estado de paginacion
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 6;

  // Filtrado de ventas por rango de fecha
  const ventasFiltradas = useMemo(() => {
    return historialVentas.filter((v) => {
      if (!v.fecha) return true;
      const fechaVenta = new Date(v.fecha);
      const ahora = new Date();

      if (filtroRapido === 'hoy') {
        return fechaVenta.toDateString() === ahora.toDateString();
      }
      if (filtroRapido === '7dias') {
        const hace7Dias = new Date();
        hace7Dias.setDate(ahora.getDate() - 7);
        return fechaVenta >= hace7Dias;
      }
      if (filtroRapido === 'mes') {
        return (
          fechaVenta.getMonth() === ahora.getMonth() &&
          fechaVenta.getFullYear() === ahora.getFullYear()
        );
      }
      if (filtroRapido === 'personalizado') {
        if (fechaInicio) {
          const dInicio = new Date(`${fechaInicio}T00:00:00`);
          if (fechaVenta < dInicio) return false;
        }
        if (fechaFin) {
          const dFin = new Date(`${fechaFin}T23:59:59`);
          if (fechaVenta > dFin) return false;
        }
        return true;
      }
      return true; // 'todas'
    });
  }, [historialVentas, filtroRapido, fechaInicio, fechaFin]);

  // Reiniciar a la primera pagina al cambiar los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroRapido, fechaInicio, fechaFin]);

  // Recalculo dinamico de totales con base en el filtro aplicado
  const totalVendido = useMemo(() => {
    return ventasFiltradas.reduce((sum, v) => sum + (v.totales?.total || 0), 0);
  }, [ventasFiltradas]);

  const totalArticulosVendidos = useMemo(() => {
    return ventasFiltradas.reduce((sum, v) => sum + (v.totales?.totalArticulos || 0), 0);
  }, [ventasFiltradas]);

  // Paginacion
  const totalPaginas = Math.ceil(ventasFiltradas.length / itemsPorPagina) || 1;
  const ventasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return ventasFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [ventasFiltradas, paginaActual, itemsPorPagina]);

  const limpiarFiltros = () => {
    setFiltroRapido('todas');
    setFechaInicio('');
    setFechaFin('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-y-auto select-none">
      {/* Cabecera del modulo con Selector de Fechas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <IconChartBar size={22} stroke={2} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
              Historial y Reportes de Ventas
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {ventasFiltradas.length} transacciones encontradas{' '}
              {filtroRapido !== 'todas' && '(filtradas)'}
            </p>
          </div>
        </div>

        {/* Filtros de Fecha Rápidos y Personalizados */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botones de presets */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFiltroRapido('todas')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filtroRapido === 'todas'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFiltroRapido('hoy')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filtroRapido === 'hoy'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setFiltroRapido('7dias')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filtroRapido === '7dias'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Días
            </button>
            <button
              type="button"
              onClick={() => setFiltroRapido('mes')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filtroRapido === 'mes'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Este Mes
            </button>
          </div>

          {/* Selector de Rango Personalizado */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 px-2 rounded-xl border border-slate-200/80">
            <TextInput
              type="date"
              size="xs"
              radius="lg"
              placeholder="Desde"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setFiltroRapido('personalizado');
              }}
              className="w-32"
            />
            <span className="text-slate-400 text-xs">-</span>
            <TextInput
              type="date"
              size="xs"
              radius="lg"
              placeholder="Hasta"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setFiltroRapido('personalizado');
              }}
              className="w-32"
            />

            {(filtroRapido !== 'todas' || fechaInicio || fechaFin) && (
              <Tooltip label="Limpiar filtros" withArrow>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={limpiarFiltros}
                  className="hover:bg-slate-200"
                >
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Recalculadas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total en Ventas</p>
          <p className="text-3xl font-black text-emerald-600 font-mono mt-1 tracking-tight">
            {formatearMoneda(totalVendido)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tickets Emitidos</p>
          <p className="text-3xl font-black text-indigo-600 font-mono mt-1 tracking-tight">
            {ventasFiltradas.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Productos Despachados</p>
          <p className="text-3xl font-black text-teal-600 font-mono mt-1 tracking-tight">
            {totalArticulosVendidos} <span className="text-xs font-normal text-slate-400">pzas</span>
          </p>
        </div>
      </div>

      {/* Tabla de Historial con Misma Estructura y Componentes */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cabecera interna del listado */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <IconReceipt size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Transacciones Registradas</h3>
          </div>
          {filtroRapido !== 'todas' && (
            <Badge color="purple" variant="light" size="xs" radius="sm">
              Filtro Activo
            </Badge>
          )}
        </div>

        {ventasFiltradas.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-slate-400 text-sm">
            <IconCalendarEvent size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No se encontraron ventas en este período</p>
            <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otro rango de fechas</p>
            <Button
              variant="subtle"
              color="indigo"
              size="xs"
              radius="xl"
              onClick={limpiarFiltros}
              className="mt-3 font-bold"
            >
              Ver Todas las Ventas
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <Table highlightOnHover verticalSpacing="md" stickyHeader className="w-full">
              <Table.Thead className="bg-slate-50/80 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
                <Table.Tr>
                  <Table.Th className="w-36">Folio de Venta</Table.Th>
                  <Table.Th className="w-48">Fecha y Hora</Table.Th>
                  <Table.Th className="min-w-[180px]">Cliente / Receptor</Table.Th>
                  <Table.Th className="w-36">Método de Pago</Table.Th>
                  <Table.Th className="w-32">Artículos</Table.Th>
                  <Table.Th className="w-32">Subtotal</Table.Th>
                  <Table.Th className="w-28">IVA (16%)</Table.Th>
                  <Table.Th className="w-36">Total Cobrado</Table.Th>
                  <Table.Th className="w-28 text-right">Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {ventasPaginadas.map((venta) => {
                  const esPublicoGeneral = !venta.cliente?.id || venta.cliente?.id === 'cli-1';
                  const nombreCliente = venta.cliente?.nombre || 'Público General';

                  return (
                    <Table.Tr key={venta.id} className="text-sm text-slate-800 hover:bg-slate-50/80 transition-colors">
                      <Table.Td className="font-mono font-bold text-xs text-indigo-600">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                          {venta.id}
                        </span>
                      </Table.Td>
                      <Table.Td className="text-xs font-mono text-slate-500">
                        {formatearFechaHora(venta.fecha)}
                      </Table.Td>
                      <Table.Td>
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              esPublicoGeneral
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-indigo-50 text-indigo-600'
                            }`}
                          >
                            {nombreCliente.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-800 truncate">
                            {nombreCliente}
                          </span>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            size="sm"
                            radius="sm"
                            variant="light"
                            color={
                              venta.pago.metodo === 'efectivo'
                                ? 'teal'
                                : venta.pago.metodo === 'tarjeta'
                                ? 'blue'
                                : 'purple'
                            }
                            leftSection={
                              venta.pago.metodo === 'efectivo' ? (
                                <IconCash size={12} />
                              ) : venta.pago.metodo === 'tarjeta' ? (
                                <IconCreditCard size={12} />
                              ) : (
                                <IconBuildingBank size={12} />
                              )
                            }
                          >
                            {venta.pago.metodo.toUpperCase()}
                          </Badge>

                          {venta.pago?.comprobante && (
                            <Tooltip label="Comprobante adjunto">
                              <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-150 inline-flex items-center justify-center">
                                <IconPaperclip size={12} />
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </Table.Td>
                      <Table.Td className="text-xs font-mono font-medium text-slate-600">
                        <Badge variant="outline" color="gray" size="sm">
                          {venta.totales.totalArticulos} {venta.totales.totalArticulos === 1 ? 'pza' : 'pzas'}
                        </Badge>
                      </Table.Td>
                      <Table.Td className="font-mono text-xs text-slate-500">
                        {formatearMoneda(venta.totales.subtotalNeto || venta.totales.subtotal / 1.16)}
                      </Table.Td>
                      <Table.Td className="font-mono text-xs text-slate-400">
                        {formatearMoneda(venta.totales.impuestos || 0)}
                      </Table.Td>
                      <Table.Td className="font-mono font-black text-emerald-700 text-sm">
                        {formatearMoneda(venta.totales.total)}
                      </Table.Td>
                      <Table.Td className="text-right">
                        <Button
                          size="xs"
                          radius="xl"
                          variant="subtle"
                          color="indigo"
                          leftSection={<IconEye size={14} />}
                          onClick={() => setVentaDetalle(venta)}
                        >
                          Ver Ticket
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>
        )}

        {/* Pie de Paginación Unificado */}
        {ventasFiltradas.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-slate-100 bg-white">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {(paginaActual - 1) * itemsPorPagina + 1} -{' '}
              {Math.min(paginaActual * itemsPorPagina, ventasFiltradas.length)} de {ventasFiltradas.length} ventas
            </span>
            {totalPaginas > 1 && (
              <Pagination
                total={totalPaginas}
                value={paginaActual}
                onChange={setPaginaActual}
                size="sm"
                radius="xl"
                color="indigo"
              />
            )}
          </div>
        )}
      </div>

      {/* Modal Detalle de Ticket Unificado */}
      <Modal
        opened={!!ventaDetalle}
        onClose={() => setVentaDetalle(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
              <IconReceipt size={18} stroke={2} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                Detalle del Ticket {ventaDetalle?.id}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Resumen completo de la compra</p>
            </div>
          </div>
        }
        centered
        radius={24}
        size="md"
        classNames={{
          header: 'border-b border-slate-100 pb-3 pt-1 px-5',
          body: 'p-5',
          content: '!rounded-3xl shadow-2xl overflow-hidden border border-slate-100',
        }}
      >
        {ventaDetalle && (
          <div className="space-y-3.5 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800 text-sm">{ventaDetalle.cliente?.nombre || 'Público General'}</p>
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">{formatearFechaHora(ventaDetalle.fecha)}</p>
              </div>
              <Badge color="indigo" radius="sm" size="sm">{ventaDetalle.pago.metodo.toUpperCase()}</Badge>
            </div>

            {/* Referencia de Pago si existe */}
            {ventaDetalle.pago?.referencia && (
              <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 text-slate-700 flex items-center justify-between">
                <span className="font-semibold text-slate-500">Folio / Autorización:</span>
                <span className="font-mono font-bold text-indigo-700">{ventaDetalle.pago.referencia}</span>
              </div>
            )}

            {/* Comprobante Adjunto si existe */}
            {ventaDetalle.pago?.comprobante && (
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                  <IconPaperclip size={14} className="text-indigo-600" />
                  Comprobante de Pago Adjunto
                </span>

                <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {ventaDetalle.pago.comprobante.startsWith('data:image/') ? (
                      <img
                        src={ventaDetalle.pago.comprobante}
                        alt="Comprobante"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
                        onClick={() => setComprobanteZoom(ventaDetalle.pago.comprobante)}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <IconFileText size={22} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Voucher / Comprobante</p>
                      <p className="text-[10px] text-slate-400">Adjuntado al momento del cobro</p>
                    </div>
                  </div>

                  <Button
                    size="xs"
                    radius="xl"
                    variant="light"
                    color="indigo"
                    leftSection={<IconExternalLink size={13} />}
                    onClick={() => {
                      if (ventaDetalle.pago.comprobante.startsWith('data:image/')) {
                        setComprobanteZoom(ventaDetalle.pago.comprobante);
                      } else {
                        const win = window.open();
                        win?.document.write(`<iframe src="${ventaDetalle.pago.comprobante}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }
                    }}
                  >
                    Ver
                  </Button>
                </div>
              </div>
            )}

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <Table verticalSpacing="xs">
                <Table.Thead className="bg-slate-100 text-slate-600 font-bold">
                  <Table.Tr>
                    <Table.Th>Cant</Table.Th>
                    <Table.Th>Descripción</Table.Th>
                    <Table.Th className="text-right">Subtotal</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ventaDetalle.articulos.map((art) => (
                    <Table.Tr key={art.id}>
                      <Table.Td className="font-mono font-bold">{art.cantidad}x</Table.Td>
                      <Table.Td className="font-medium text-slate-800">{art.nombre}</Table.Td>
                      <Table.Td className="font-mono text-right font-bold text-slate-700">
                        {formatearMoneda(art.subtotal)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>

            <div className="pt-2 flex justify-between items-center font-bold text-base text-slate-900 border-t border-slate-100">
              <span className="text-sm text-slate-600">Total Liquidado:</span>
              <span className="font-mono text-xl text-emerald-600 font-black">
                {formatearMoneda(ventaDetalle.totales.total)}
              </span>
            </div>

            {/* Acciones del Ticket */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                variant="default"
                size="xs"
                radius="xl"
                onClick={() => setVentaDetalle(null)}
              >
                Cerrar
              </Button>
              <Button
                color="indigo"
                size="xs"
                radius="xl"
                leftSection={<IconPrinter size={15} />}
                onClick={() => window.print()}
                className="font-bold shadow-xs"
              >
                Imprimir Ticket
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Elemento de impresión cuando se imprime desde el historial */}
      <div className="hidden print:block">
        {ventaDetalle && <TicketImpresion venta={ventaDetalle} />}
      </div>

      {/* Modal Lightbox para Ampliación de Comprobante */}
      <Modal
        opened={!!comprobanteZoom}
        onClose={() => setComprobanteZoom(null)}
        title={
          <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <IconPaperclip size={16} className="text-indigo-600" />
            Comprobante de Pago
          </span>
        }
        centered
        size="lg"
        radius={20}
      >
        {comprobanteZoom && (
          <div className="flex flex-col items-center justify-center p-2 gap-3">
            <img
              src={comprobanteZoom}
              alt="Comprobante ampliado"
              className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain border border-slate-200 shadow-md"
            />
            <Button
              variant="default"
              size="xs"
              radius="xl"
              onClick={() => setComprobanteZoom(null)}
            >
              Cerrar
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
