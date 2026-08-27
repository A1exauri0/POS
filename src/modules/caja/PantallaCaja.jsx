import { useState } from 'react';
import {
  Button,
  TextInput,
  NumberInput,
  Badge,
  Modal,
  Group,
  Table,
  Select,
} from '@mantine/core';
import {
  IconCashRegister,
  IconLockOpen,
  IconLock,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconHistory,
} from '@tabler/icons-react';
import { useCaja } from '../../contexts/CajaContext';
import { useVenta } from '../../contexts/VentaContext';
import { formatearMoneda, formatearFechaHora } from '../../utils/formateadores';
import { ModalConfirmacion } from '../../components/ModalConfirmacion';

export const PantallaCaja = () => {
  const { cajaAbierta, turnoActual, abrirCaja, cerrarCaja, registrarMovimiento } = useCaja();
  const { historialVentas } = useVenta();

  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false);
  const [modalAperturaAbierto, setModalAperturaAbierto] = useState(false);
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState('salida');
  const [montoMovimiento, setMontoMovimiento] = useState(0);
  const [conceptoMovimiento, setConceptoMovimiento] = useState('');
  const [fondoApertura, setFondoApertura] = useState(500);

  // Total de ventas en efectivo del turno
  const totalVentasEfectivo = historialVentas
    .filter((v) => v.pago.metodo === 'efectivo')
    .reduce((sum, v) => sum + v.totales.total, 0);

  const totalEntradas = (turnoActual?.movimientos || [])
    .filter((m) => m.tipo === 'entrada')
    .reduce((sum, m) => sum + m.monto, 0);

  const totalSalidas = (turnoActual?.movimientos || [])
    .filter((m) => m.tipo === 'salida')
    .reduce((sum, m) => sum + m.monto, 0);

  const efectivoEsperado =
    (turnoActual?.fondoInicial || 0) + totalVentasEfectivo + totalEntradas - totalSalidas;

  const guardarMovimiento = () => {
    if (montoMovimiento <= 0 || !conceptoMovimiento.trim()) return;
    registrarMovimiento(tipoMovimiento, montoMovimiento, conceptoMovimiento);
    setModalMovimientoAbierto(false);
    setMontoMovimiento(0);
    setConceptoMovimiento('');
  };

  const confirmarApertura = () => {
    abrirCaja(fondoApertura);
    setModalAperturaAbierto(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-y-auto">
      {/* Cabecera del modulo unificada */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <IconCashRegister size={22} stroke={2} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">Control de Caja y Turnos</h2>
            <p className="text-xs text-slate-500 font-medium">
              {cajaAbierta ? `Turno activo (${turnoActual?.id})` : 'Caja inactiva o cerrada'}
            </p>
          </div>
        </div>

        <Group gap="sm">
          {cajaAbierta ? (
            <>
              <Button
                variant="light"
                color="indigo"
                radius="xl"
                size="sm"
                leftSection={<IconArrowUpRight size={16} />}
                onClick={() => setModalMovimientoAbierto(true)}
                className="font-semibold"
              >
                Entrada / Salida de Efectivo
              </Button>
              <Button
                color="red"
                variant="filled"
                radius="xl"
                size="sm"
                leftSection={<IconLock size={16} />}
                onClick={() => setModalCierreAbierto(true)}
                className="font-bold shadow-md shadow-rose-500/15"
              >
                Cerrar Caja (Corte)
              </Button>
            </>
          ) : (
            <Button
              color="teal"
              radius="xl"
              size="sm"
              leftSection={<IconLockOpen size={16} />}
              onClick={() => setModalAperturaAbierto(true)}
              className="font-bold shadow-md shadow-teal-500/15"
            >
              Abrir Nueva Caja
            </Button>
          )}
        </Group>
      </div>

      {/* Tarjetas de Resumen de Efectivo Unificadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Fondo Inicial</p>
          <p className="text-2xl font-bold text-slate-800 font-mono mt-1">
            {formatearMoneda(turnoActual?.fondoInicial || 0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ventas en Efectivo</p>
          <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {formatearMoneda(totalVentasEfectivo)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Entradas / Salidas</p>
          <p className="text-xl font-bold text-slate-700 font-mono mt-1 truncate">
            +{formatearMoneda(totalEntradas)} / -{formatearMoneda(totalSalidas)}
          </p>
        </div>

        <div className="bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Efectivo Total en Caja</p>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-1 tracking-tight">
            {formatearMoneda(efectivoEsperado)}
          </p>
        </div>
      </div>

      {/* Historial de Movimientos Unificado */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IconHistory size={18} className="text-slate-500" /> Movimientos Registrados en el Turno
        </h3>

        {(turnoActual?.movimientos || []).length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No se han registrado movimientos de entrada o salida en este turno.
          </div>
        ) : (
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead className="bg-slate-50/80 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
              <Table.Tr>
                <Table.Th>Hora</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Concepto / Motivo</Table.Th>
                <Table.Th className="text-right">Monto</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(turnoActual?.movimientos || []).map((mov) => (
                <Table.Tr key={mov.id} className="text-sm text-slate-800">
                  <Table.Td className="text-xs font-mono text-slate-500">
                    {formatearFechaHora(mov.fecha)}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      size="sm"
                      radius="sm"
                      variant="light"
                      color={mov.tipo === 'entrada' ? 'teal' : 'red'}
                      leftSection={
                        mov.tipo === 'entrada' ? (
                          <IconArrowDownLeft size={12} />
                        ) : (
                          <IconArrowUpRight size={12} />
                        )
                      }
                    >
                      {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                    </Badge>
                  </Table.Td>
                  <Table.Td className="text-xs text-slate-700 font-medium">{mov.concepto}</Table.Td>
                  <Table.Td
                    className={`text-xs font-mono font-bold text-right ${
                      mov.tipo === 'entrada' ? 'text-teal-600' : 'text-rose-600'
                    }`}
                  >
                    {mov.tipo === 'entrada' ? '+' : '-'}
                    {formatearMoneda(mov.monto)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </div>

      {/* Modal Entrada / Salida */}
      <Modal
        opened={modalMovimientoAbierto}
        onClose={() => setModalMovimientoAbierto(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <IconArrowUpRight size={18} stroke={2} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                Registrar Movimiento de Efectivo
              </h3>
              <p className="text-xs text-slate-400 font-medium">Ingresos o egresos extraordinarios de caja</p>
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
        <div className="space-y-4">
          <Select
            label="Tipo de Movimiento"
            data={[
              { value: 'salida', label: 'Salida de Efectivo (Gasto, Pago a proveedor)' },
              { value: 'entrada', label: 'Entrada de Efectivo (Aporte extra)' },
            ]}
            value={tipoMovimiento}
            onChange={(v) => setTipoMovimiento(v || 'salida')}
            radius="lg"
          />

          <NumberInput
            label="Monto ($)"
            value={montoMovimiento}
            onChange={(v) => setMontoMovimiento(typeof v === 'number' ? v : 0)}
            min={0}
            decimalScale={2}
            radius="lg"
            required
          />

          <TextInput
            label="Concepto / Motivo"
            placeholder="Ej. Pago de garrafones de agua, compra de bolsas..."
            value={conceptoMovimiento}
            onChange={(e) => setConceptoMovimiento(e.target.value)}
            radius="lg"
            required
          />

          <Group justify="flex-end" gap="sm" pt="xs" className="border-t border-slate-100">
            <Button variant="default" radius="xl" onClick={() => setModalMovimientoAbierto(false)}>
              Cancelar
            </Button>
            <Button color="indigo" radius="xl" className="font-bold shadow-md shadow-indigo-500/15" onClick={guardarMovimiento}>
              Guardar Movimiento
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Modal Apertura de Caja */}
      <Modal
        opened={modalAperturaAbierto}
        onClose={() => setModalAperturaAbierto(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
              <IconLockOpen size={18} stroke={2} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                Apertura de Caja
              </h3>
              <p className="text-xs text-slate-400 font-medium">Inicia un nuevo turno de trabajo</p>
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
        <div className="space-y-4">
          <NumberInput
            label="Fondo Inicial en Efectivo ($)"
            value={fondoApertura}
            onChange={(v) => setFondoApertura(typeof v === 'number' ? v : 0)}
            min={0}
            decimalScale={2}
            radius="lg"
          />
          <Group justify="flex-end" gap="sm" pt="xs" className="border-t border-slate-100">
            <Button variant="default" radius="xl" onClick={() => setModalAperturaAbierto(false)}>
              Cancelar
            </Button>
            <Button color="teal" radius="xl" className="font-bold shadow-md shadow-teal-500/15" onClick={confirmarApertura}>
              Abrir Turno
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Modal de confirmacion para corte de caja */}
      <ModalConfirmacion
        abierto={modalCierreAbierto}
        alCerrar={() => setModalCierreAbierto(false)}
        alConfirmar={cerrarCaja}
        titulo="¿Cerrar turno de caja?"
        mensaje="Se realizará el corte del turno actual y se generará el balance final de caja."
        textoConfirmar="Cerrar Caja"
        color="red"
        icono={IconLock}
      />
    </div>
  );
};
