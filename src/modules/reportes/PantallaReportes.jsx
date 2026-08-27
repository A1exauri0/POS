import { useState, useMemo, useEffect } from 'react';
import { Table, Badge, Button, Modal, Pagination, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import {
  IconChartBar,
  IconReceipt,
  IconEye,
  IconCreditCard,
  IconCash,
  IconBuildingBank,
  IconCalendar,
  IconFilter,
  IconX,
  IconCalendarEvent,
} from '@tabler/icons-react';
import { useVenta } from '../../contexts/VentaContext';
import { formatearMoneda, formatearFechaHora } from '../../utils/formateadores';

export const PantallaReportes = () => {
  const { historialVentas } = useVenta();
  const [ventaDetalle, setVentaDetalle] = useState(null);

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

      {/* Tabla de Historial con Paginacion */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <IconReceipt size={18} className="text-slate-500" /> Transacciones Registradas
            </h3>
            {filtroRapido !== 'todas' && (
              <Badge color="purple" variant="light" size="xs" radius="sm">
                Filtro Activo
              </Badge>
            )}
          </div>

          {ventasFiltradas.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              <IconCalendarEvent size={36} className="mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">No se encontraron ventas en este período</p>
              <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otro rango de fechas</p>
              <Button
                variant="subtle"
                color="purple"
                size="xs"
                radius="xl"
                onClick={limpiarFiltros}
                className="mt-3 font-bold"
              >
                Ver Todas las Ventas
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead className="bg-slate-50/80 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
                  <Table.Tr>
                    <Table.Th>Folio</Table.Th>
                    <Table.Th>Fecha / Hora</Table.Th>
                    <Table.Th>Cliente</Table.Th>
                    <Table.Th>Método de Pago</Table.Th>
                    <Table.Th>Artículos</Table.Th>
                    <Table.Th>Total</Table.Th>
                    <Table.Th className="text-right">Detalle</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ventasPaginadas.map((venta) => (
                    <Table.Tr key={venta.id} className="text-sm text-slate-800">
                      <Table.Td className="font-mono font-bold text-xs text-indigo-600">
                        {venta.id}
                      </Table.Td>
                      <Table.Td className="text-xs font-mono text-slate-500">
                        {formatearFechaHora(venta.fecha)}
                      </Table.Td>
                      <Table.Td className="text-xs font-medium">{venta.cliente?.nombre || 'Público General'}</Table.Td>
                      <Table.Td>
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
                      </Table.Td>
                      <Table.Td className="text-xs font-mono">
                        {venta.totales.totalArticulos} pzs
                      </Table.Td>
                      <Table.Td className="font-mono font-extrabold text-emerald-700">
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
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          )}
        </div>

        {/* Barra Inferior de Paginacion */}
        {ventasFiltradas.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
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
          </div>
        )}
      </Modal>
    </div>
  );
};
