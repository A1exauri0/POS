import { useState } from 'react';
import { Table, Badge, Button, Modal, Group } from '@mantine/core';
import {
  IconChartBar,
  IconReceipt,
  IconEye,
  IconCreditCard,
  IconCash,
  IconBuildingBank,
} from '@tabler/icons-react';
import { useVenta } from '../../contexts/VentaContext';
import { formatearMoneda, formatearFechaHora } from '../../utils/formateadores';

export const PantallaReportes = () => {
  const { historialVentas } = useVenta();
  const [ventaDetalle, setVentaDetalle] = useState(null);

  const totalVendido = historialVentas.reduce((sum, v) => sum + v.totales.total, 0);
  const totalArticulosVendidos = historialVentas.reduce(
    (sum, v) => sum + v.totales.totalArticulos,
    0
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-y-auto">
      {/* Cabecera del modulo unificada */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <IconChartBar size={22} stroke={2} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
              Historial y Reportes de Ventas
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {historialVentas.length} transacciones registradas históricamente
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Unificadas */}
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
            {historialVentas.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Productos Despachados</p>
          <p className="text-3xl font-black text-teal-600 font-mono mt-1 tracking-tight">
            {totalArticulosVendidos} <span className="text-xs font-normal text-slate-400">pzas</span>
          </p>
        </div>
      </div>

      {/* Tabla de Historial Unificada */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IconReceipt size={18} className="text-slate-500" /> Transacciones Recientes
        </h3>

        {historialVentas.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aún no se han registrado ventas en el sistema.
          </div>
        ) : (
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
              {historialVentas.map((venta) => (
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
