import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Tabs,
  NumberInput,
  TextInput,
  Button,
  Group,
  Text,
  Badge,
} from '@mantine/core';
import {
  IconCash,
  IconCreditCard,
  IconBuildingBank,
  IconCheck,
  IconArrowRight,
} from '@tabler/icons-react';
import { formatearMoneda } from '../../../utils/formateadores';
import { useVenta } from '../../../contexts/VentaContext';

const DENOMINACIONES_RAPIDAS = [50, 100, 200, 500, 1000];

export const ModalCobro = () => {
  const {
    modalCobroAbierto,
    setModalCobroAbierto,
    totales,
    completarVenta,
    cliente,
  } = useVenta();

  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState(totales.total);
  const [referenciaPago, setReferenciaPago] = useState('');
  const inputRecibidoRef = useRef(null);

  // Al abrir el modal, inicializar valores y dar foco
  useEffect(() => {
    if (modalCobroAbierto) {
      setMontoRecibido(totales.total);
      setMetodoPago('efectivo');
      setReferenciaPago('');
      setTimeout(() => {
        inputRecibidoRef.current?.focus();
        inputRecibidoRef.current?.select();
      }, 100);
    }
  }, [modalCobroAbierto, totales.total]);

  const cambioCalculado = Math.max(0, (montoRecibido || 0) - totales.total);
  const faltaDinero = metodoPago === 'efectivo' && (montoRecibido || 0) < totales.total;

  const manejarCobro = () => {
    if (faltaDinero) return;

    completarVenta({
      metodo: metodoPago,
      montoRecibido: metodoPago === 'efectivo' ? montoRecibido : totales.total,
      cambio: metodoPago === 'efectivo' ? cambioCalculado : 0,
      referencia: referenciaPago,
    });
  };

  // Manejo de atajos Enter para cobrar
  const manejarKeyDown = (e) => {
    if (e.key === 'Enter' && !faltaDinero) {
      e.preventDefault();
      manejarCobro();
    }
  };

  return (
    <Modal
      opened={modalCobroAbierto}
      onClose={() => setModalCobroAbierto(false)}
      title={
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-lg">Cobro de Venta</span>
          <Badge color="indigo" variant="light">
            Cliente: {cliente.nombre}
          </Badge>
        </div>
      }
      size="lg"
      centered
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <div className="space-y-4 pt-1" onKeyDown={manejarKeyDown}>
        {/* Banner de Total a Cobrar */}
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-inner">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total a Liquidar
            </p>
            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {formatearMoneda(totales.total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total de Artículos</p>
            <p className="text-lg font-bold text-slate-200 font-mono">
              {totales.totalArticulos}
            </p>
          </div>
        </div>

        {/* Metodos de Pago */}
        <Tabs value={metodoPago} onChange={setMetodoPago} color="indigo" radius="md">
          <Tabs.List grow>
            <Tabs.Tab value="efectivo" leftSection={<IconCash size={18} />}>
              Efectivo
            </Tabs.Tab>
            <Tabs.Tab value="tarjeta" leftSection={<IconCreditCard size={18} />}>
              Tarjeta
            </Tabs.Tab>
            <Tabs.Tab value="transferencia" leftSection={<IconBuildingBank size={18} />}>
              Transferencia
            </Tabs.Tab>
          </Tabs.List>

          {/* Tab: Pago en Efectivo */}
          <Tabs.Panel value="efectivo" pt="md" className="space-y-4">
            {/* Botones de Denominaciones Rapidas */}
            <div>
              <Text size="xs" fw={600} c="dimmed" mb={6}>
                Denominaciones rápidas / Billetes:
              </Text>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  color="indigo"
                  onClick={() => setMontoRecibido(totales.total)}
                >
                  Exacto (${totales.total.toFixed(2)})
                </Button>
                {DENOMINACIONES_RAPIDAS.map((monto) => (
                  <Button
                    key={monto}
                    size="xs"
                    variant="default"
                    onClick={() => setMontoRecibido(monto)}
                    disabled={monto < totales.total}
                  >
                    ${monto}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input de Monto Recibido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Text size="xs" fw={600} c="dimmed" mb={4}>
                  Monto Recibido ($):
                </Text>
                <NumberInput
                  ref={inputRecibidoRef}
                  value={montoRecibido}
                  onChange={(val) => setMontoRecibido(typeof val === 'number' ? val : 0)}
                  min={0}
                  decimalScale={2}
                  size="lg"
                  radius="md"
                  prefix="$ "
                  thousandSeparator=","
                  classNames={{
                    input: 'font-mono font-bold text-xl text-slate-800',
                  }}
                />
              </div>

              {/* Recuadro de Cambio a Regresar */}
              <div
                className={`p-3 rounded-xl border flex flex-col justify-center ${
                  faltaDinero
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {faltaDinero ? 'Falta por Pagar' : 'Cambio para el Cliente'}
                </span>
                <span className="text-2xl font-black font-mono mt-0.5">
                  {faltaDinero
                    ? formatearMoneda(totales.total - (montoRecibido || 0))
                    : formatearMoneda(cambioCalculado)}
                </span>
              </div>
            </div>
          </Tabs.Panel>

          {/* Tab: Pago con Tarjeta */}
          <Tabs.Panel value="tarjeta" pt="md" className="space-y-3">
            <p className="text-xs text-slate-500">
              Procesa el pago en la terminal bancaria e ingresa los últimos 4 dígitos o número de autorización.
            </p>
            <TextInput
              label="Número de Autorización / Últimos 4 dígitos:"
              placeholder="Ej. 4839 o AUT-8921"
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
              size="md"
              radius="md"
            />
          </Tabs.Panel>

          {/* Tab: Pago con Transferencia */}
          <Tabs.Panel value="transferencia" pt="md" className="space-y-3">
            <p className="text-xs text-slate-500">
              Verifica la recepción de la transferencia SPEI / CoDi antes de confirmar.
            </p>
            <TextInput
              label="Clave de Rastreo / Folio SPEI:"
              placeholder="Ej. 2026082601923"
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
              size="md"
              radius="md"
            />
          </Tabs.Panel>
        </Tabs>

        {/* Botones de Confirmar o Cancelar */}
        <Group justify="flex-end" gap="sm" pt="sm" className="border-t border-slate-200">
          <Button
            variant="subtle"
            color="gray"
            size="md"
            onClick={() => setModalCobroAbierto(false)}
          >
            Cancelar (ESC)
          </Button>

          <Button
            color="teal"
            size="md"
            disabled={faltaDinero}
            onClick={manejarCobro}
            leftSection={<IconCheck size={18} />}
            className="font-bold shadow-md"
          >
            Completar Venta [Enter]
          </Button>
        </Group>
      </div>
    </Modal>
  );
};
