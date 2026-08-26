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
      {/* Cabecera */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
            <IconChartBar size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Historial y Reportes de Ventas</h2>
            <p className="text-xs text-slate-500">Registro histórico de transacciones realizadas</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadisticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total en Ventas</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatearMoneda(totalVendido)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Tickets Emitidos</p>
          <p className="text-2xl font-bold text-indigo-600 font-mono mt-1">
            {historialVentas.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Productos Despachados</p>
          <p className="text-2xl font-bold text-teal-600 font-mono mt-1">
            {totalArticulosVendidos}
          </p>
        </div>
      </div>

      {/* Tabla de Historial */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-xs overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IconReceipt size={18} className="text-slate-500" /> Transacciones Recientes
        </h3>

        {historialVentas.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aún no se han registrado ventas en el sistema.
          </div>
        ) : (
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead className="bg-slate-50 text-slate-600 text-xs uppercase">
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
                  <Table.Td className="text-xs font-medium">{venta.cliente?.nombre}</Table.Td>
                  <Table.Td>
                    <Badge
                      size="sm"
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

      {/* Modal Detalle de Ticket */}
      <Modal
        opened={!!ventaDetalle}
        onClose={() => setVentaDetalle(null)}
        title={
          <span className="font-bold text-slate-800">
            Detalle del Ticket {ventaDetalle?.id}
          </span>
        }
        centered
        radius="lg"
      >
        {ventaDetalle && (
          <div className="space-y-3 pt-1 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
              <div>
                <p className="font-bold text-slate-700">{ventaDetalle.cliente?.nombre}</p>
                <p className="text-slate-400 font-mono">{formatearFechaHora(ventaDetalle.fecha)}</p>
              </div>
              <Badge color="indigo">{ventaDetalle.pago.metodo.toUpperCase()}</Badge>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
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
                      <Table.Td>{art.nombre}</Table.Td>
                      <Table.Td className="font-mono text-right">
                        {formatearMoneda(art.subtotal)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>

            <div className="pt-2 flex justify-between font-bold text-base text-slate-900 border-t">
              <span>Total Pagado:</span>
              <span className="font-mono text-emerald-600">
                {formatearMoneda(ventaDetalle.totales.total)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
