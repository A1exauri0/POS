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
      {/* Cabecera */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
            <IconCashRegister size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Control de Caja y Turnos</h2>
            <p className="text-xs text-slate-500">
              {cajaAbierta ? `Turno activo (${turnoActual?.id})` : 'Caja inactiva'}
            </p>
          </div>
        </div>

        <Group>
          {cajaAbierta ? (
            <>
              <Button
                variant="light"
                color="indigo"
                leftSection={<IconArrowUpRight size={18} />}
                onClick={() => setModalMovimientoAbierto(true)}
              >
                Entrada / Salida de Efectivo
              </Button>
              <Button
                color="red"
                variant="filled"
                leftSection={<IconLock size={18} />}
                onClick={() => setModalCierreAbierto(true)}
              >
                Cerrar Caja (Corte)
              </Button>
            </>
          ) : (
            <Button
              color="teal"
              leftSection={<IconLockOpen size={18} />}
              onClick={() => setModalAperturaAbierto(true)}
            >
              Abrir Nueva Caja
            </Button>
          )}
        </Group>
      </div>

      {/* Tarjetas de Resumen de Efectivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Fondo Inicial</p>
          <p className="text-xl font-bold text-slate-800 font-mono mt-1">
            {formatearMoneda(turnoActual?.fondoInicial || 0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Ventas en Efectivo</p>
          <p className="text-xl font-bold text-emerald-600 font-mono mt-1">
            {formatearMoneda(totalVentasEfectivo)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Entradas / Salidas</p>
          <p className="text-xl font-bold text-slate-700 font-mono mt-1">
            +{formatearMoneda(totalEntradas)} / -{formatearMoneda(totalSalidas)}
          </p>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs">
          <p className="text-xs text-slate-400 font-semibold uppercase">Efectivo en Caja Total</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {formatearMoneda(efectivoEsperado)}
          </p>
        </div>
      </div>

      {/* Historial de Movimientos */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <IconHistory size={18} className="text-slate-500" /> Movimientos Registrados en el Turno
        </h3>

        <Table highlightOnHover verticalSpacing="xs">
          <Table.Thead className="bg-slate-50 text-slate-600 text-xs">
            <Table.Tr>
              <Table.Th>Hora</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Concepto / Motivo</Table.Th>
              <Table.Th className="text-right">Monto</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(turnoActual?.movimientos || []).map((mov) => (
              <Table.Tr key={mov.id}>
                <Table.Td className="text-xs font-mono text-slate-500">
                  {formatearFechaHora(mov.fecha)}
                </Table.Td>
                <Table.Td>
                  <Badge
                    size="xs"
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
                <Table.Td className="text-xs text-slate-700">{mov.concepto}</Table.Td>
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
      </div>

      {/* Modal Entrada / Salida */}
      <Modal
        opened={modalMovimientoAbierto}
        onClose={() => setModalMovimientoAbierto(false)}
        title={<span className="font-bold text-slate-800">Registrar Movimiento de Efectivo</span>}
        centered
      >
        <div className="space-y-3 pt-2">
          <Select
            label="Tipo de Movimiento"
            data={[
              { value: 'salida', label: 'Salida de Efectivo (Gasto, Pago a proveedor)' },
              { value: 'entrada', label: 'Entrada de Efectivo (Aporte extra)' },
            ]}
            value={tipoMovimiento}
            onChange={(v) => setTipoMovimiento(v || 'salida')}
          />

          <NumberInput
            label="Monto ($)"
            value={montoMovimiento}
            onChange={(v) => setMontoMovimiento(typeof v === 'number' ? v : 0)}
            min={0}
            decimalScale={2}
            required
          />

          <TextInput
            label="Concepto / Motivo"
            placeholder="Ej. Pago de garrafones de agua, compra de bolsas..."
            value={conceptoMovimiento}
            onChange={(e) => setConceptoMovimiento(e.target.value)}
            required
          />

          <Group justify="flex-end" pt="sm">
            <Button variant="default" onClick={() => setModalMovimientoAbierto(false)}>
              Cancelar
            </Button>
            <Button color="indigo" onClick={guardarMovimiento}>
              Guardar Movimiento
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Modal Apertura de Caja */}
      <Modal
        opened={modalAperturaAbierto}
        onClose={() => setModalAperturaAbierto(false)}
        title={<span className="font-bold text-slate-800">Apertura de Caja</span>}
        centered
      >
        <div className="space-y-3 pt-2">
          <NumberInput
            label="Fondo Inicial en Efectivo ($)"
            value={fondoApertura}
            onChange={(v) => setFondoApertura(typeof v === 'number' ? v : 0)}
            min={0}
            decimalScale={2}
          />
          <Group justify="flex-end" pt="sm">
            <Button variant="default" onClick={() => setModalAperturaAbierto(false)}>
              Cancelar
            </Button>
            <Button color="teal" onClick={confirmarApertura}>
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
