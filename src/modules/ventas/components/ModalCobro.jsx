import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  SegmentedControl,
  NumberInput,
  TextInput,
  Button,
  Group,
  Badge,
} from '@mantine/core';
import {
  IconCash,
  IconCreditCard,
  IconBuildingBank,
  IconCheck,
  IconReceipt,
  IconCoins,
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
      }, 120);
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
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <IconReceipt size={20} stroke={2} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">Cobro de Venta</h2>
            <p className="text-xs text-slate-500 font-medium">Cliente: {cliente?.nombre || 'Público General'}</p>
          </div>
        </div>
      }
      size={540}
      centered
      radius={24}
      overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
      classNames={{
        header: 'border-b border-slate-100 pb-3 pt-1 px-5',
        body: 'p-5 pt-3',
        content: '!rounded-3xl shadow-2xl overflow-hidden border border-slate-100',
      }}
    >
      <div className="space-y-4 select-none" onKeyDown={manejarKeyDown}>
        {/* Banner Estilizado y Compacto de Total a Liquidar */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 py-3.5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
              Total a Liquidar
            </span>
            <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight block">
              {formatearMoneda(totales.total)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-300 font-mono bg-white/10 px-3 py-1 rounded-xl inline-block border border-white/10">
              {totales.totalArticulos} {totales.totalArticulos === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>
        </div>

        {/* Selector Moderno de Método de Pago */}
        <SegmentedControl
          value={metodoPago}
          onChange={setMetodoPago}
          fullWidth
          size="md"
          radius="xl"
          color="indigo"
          data={[
            {
              value: 'efectivo',
              label: (
                <div className="flex items-center justify-center gap-1.5 py-1 font-semibold text-xs sm:text-sm">
                  <IconCash size={18} />
                  <span>Efectivo</span>
                </div>
              ),
            },
            {
              value: 'tarjeta',
              label: (
                <div className="flex items-center justify-center gap-1.5 py-1 font-semibold text-xs sm:text-sm">
                  <IconCreditCard size={18} />
                  <span>Tarjeta</span>
                </div>
              ),
            },
            {
              value: 'transferencia',
              label: (
                <div className="flex items-center justify-center gap-1.5 py-1 font-semibold text-xs sm:text-sm">
                  <IconBuildingBank size={18} />
                  <span>Transferencia</span>
                </div>
              ),
            },
          ]}
        />

        {/* Panel: Pago en Efectivo */}
        {metodoPago === 'efectivo' && (
          <div className="space-y-3.5">
            {/* Billetes y Denominaciones Rápidas como píldoras redondeadas */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <IconCoins size={14} className="text-slate-400" /> Billetes sugeridos:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMontoRecibido(totales.total)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    montoRecibido === totales.total
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}
                >
                  Exacto ({formatearMoneda(totales.total)})
                </button>

                {DENOMINACIONES_RAPIDAS.map((monto) => (
                  <button
                    key={monto}
                    type="button"
                    onClick={() => setMontoRecibido(monto)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                      montoRecibido === monto
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ${monto}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Equilibrado: Monto Recibido y Cambio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
              {/* Columna Izquierda: Input Monto Recibido */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Monto Recibido
                </span>
                <NumberInput
                  ref={inputRecibidoRef}
                  value={montoRecibido}
                  onChange={(val) => setMontoRecibido(typeof val === 'number' ? val : 0)}
                  min={0}
                  decimalScale={2}
                  fixedDecimalScale
                  hideControls
                  size="md"
                  radius="xl"
                  prefix="$ "
                  thousandSeparator=","
                  classNames={{
                    input:
                      'font-mono font-black text-2xl text-slate-900 bg-white border-slate-300 h-13 shadow-inner',
                  }}
                />
              </div>

              {/* Columna Derecha: Tarjeta de Cambio / Falta por Pagar */}
              <div
                className={`p-3 rounded-2xl border-2 flex flex-col justify-between transition-colors shadow-2xs ${
                  faltaDinero
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wider block">
                  {faltaDinero ? 'Falta por Pagar' : 'Cambio para Cliente'}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight block py-0.5">
                  {faltaDinero
                    ? formatearMoneda(totales.total - (montoRecibido || 0))
                    : formatearMoneda(cambioCalculado)}
                </span>
                <span className="text-[10px] font-semibold opacity-75 block">
                  {faltaDinero ? 'El importe recibido es menor' : 'Importe a devolver'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Panel: Pago con Tarjeta */}
        {metodoPago === 'tarjeta' && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Procesa el cobro por <strong className="text-slate-900">{formatearMoneda(totales.total)}</strong> en tu terminal bancaria e ingresa el número de autorización.
            </p>
            <TextInput
              label="Número de Autorización / Últimos 4 dígitos:"
              placeholder="Ej. 4829 o AUT-9921"
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
              size="md"
              radius="lg"
              autoFocus
            />
          </div>
        )}

        {/* Panel: Pago con Transferencia */}
        {metodoPago === 'transferencia' && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Verifica el abono de <strong className="text-slate-900">{formatearMoneda(totales.total)}</strong> vía SPEI / CoDi antes de confirmar la venta.
            </p>
            <TextInput
              label="Clave de Rastreo / Folio SPEI:"
              placeholder="Ej. 2026082601923"
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
              size="md"
              radius="lg"
              autoFocus
            />
          </div>
        )}

        {/* Pie de Acciones */}
        <Group justify="flex-end" gap="sm" pt="xs" className="border-t border-slate-100">
          <Button
            variant="default"
            size="md"
            radius="xl"
            onClick={() => setModalCobroAbierto(false)}
          >
            Cancelar (ESC)
          </Button>

          <Button
            color="teal"
            size="md"
            radius="xl"
            disabled={faltaDinero}
            onClick={manejarCobro}
            leftSection={<IconCheck size={18} />}
            className="font-extrabold shadow-md shadow-teal-600/20"
          >
            Completar Venta [Enter]
          </Button>
        </Group>
      </div>
    </Modal>
  );
};
