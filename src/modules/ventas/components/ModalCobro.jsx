import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  SegmentedControl,
  NumberInput,
  TextInput,
  Button,
  Group,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCash,
  IconCreditCard,
  IconBuildingBank,
  IconCheck,
  IconReceipt,
  IconCoins,
  IconUpload,
  IconFileText,
  IconTrash,
  IconPaperclip,
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
  const [comprobante, setComprobante] = useState(null); // { nombre, tipo, dataUrl, tamaño }
  const inputRecibidoRef = useRef(null);
  const archivoInputRef = useRef(null);

  // Al abrir el modal, inicializar valores y dar foco
  useEffect(() => {
    if (modalCobroAbierto) {
      setMontoRecibido(totales.total);
      setMetodoPago('efectivo');
      setReferenciaPago('');
      setComprobante(null);
      setTimeout(() => {
        inputRecibidoRef.current?.focus();
        inputRecibidoRef.current?.select();
      }, 120);
    }
  }, [modalCobroAbierto, totales.total]);

  const cambioCalculado = Math.max(0, (montoRecibido || 0) - totales.total);
  const faltaDinero = metodoPago === 'efectivo' && (montoRecibido || 0) < totales.total;

  // Procesar archivo de comprobante y optimizar si es imagen
  const procesarArchivo = (archivo) => {
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = (e) => {
      const dataUrl = e.target.result;

      // Si es imagen, optimizar resolución máxima para mantener base de datos liviana
      if (archivo.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrlOptimizado = canvas.toDataURL('image/jpeg', 0.82);

          setComprobante({
            nombre: archivo.name,
            tipo: archivo.type,
            tamaño: `${(archivo.size / 1024).toFixed(1)} KB`,
            dataUrl: dataUrlOptimizado,
          });
        };
        img.src = dataUrl;
      } else {
        // PDF u otros formatos admitidos
        setComprobante({
          nombre: archivo.name,
          tipo: archivo.type,
          tamaño: `${(archivo.size / 1024).toFixed(1)} KB`,
          dataUrl,
        });
      }
    };
    lector.readAsDataURL(archivo);
  };

  const manejarCambioArchivo = (e) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      procesarArchivo(archivo);
    }
  };

  const manejarSoltarArchivo = (e) => {
    e.preventDefault();
    const archivo = e.dataTransfer.files?.[0];
    if (archivo) {
      procesarArchivo(archivo);
    }
  };

  const manejarCobro = () => {
    if (faltaDinero) return;

    completarVenta({
      metodo: metodoPago,
      montoRecibido: metodoPago === 'efectivo' ? montoRecibido : totales.total,
      cambio: metodoPago === 'efectivo' ? cambioCalculado : 0,
      referencia: referenciaPago,
      comprobante: comprobante?.dataUrl || null,
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
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
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
        {/* Banner Limpio y Cohesivo de Total a Liquidar (Sin efecto metálico) */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              Total a Liquidar
            </span>
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight block">
              {formatearMoneda(totales.total)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-xl inline-block border border-indigo-200/80 shadow-2xs font-mono">
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
            {/* Billetes y Denominaciones Rápidas */}
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
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ${monto}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid: Monto Recibido y Cambio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
              {/* Columna Izquierda: Input Monto Recibido */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
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
                      'font-mono font-black text-2xl text-slate-900 bg-white border-slate-300 h-13 shadow-2xs',
                  }}
                />
              </div>

              {/* Columna Derecha: Tarjeta de Cambio / Falta por Pagar */}
              <div
                className={`p-3 rounded-2xl border flex flex-col justify-between transition-colors shadow-2xs ${
                  faltaDinero
                    ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider block">
                  {faltaDinero ? 'Falta por Pagar' : 'Cambio para Cliente'}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight block py-0.5">
                  {faltaDinero
                    ? formatearMoneda(totales.total - (montoRecibido || 0))
                    : formatearMoneda(cambioCalculado)}
                </span>
                <span className="text-[10px] font-medium opacity-80 block">
                  {faltaDinero ? 'El importe recibido es menor' : 'Importe a devolver'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Panel: Pago con Tarjeta */}
        {metodoPago === 'tarjeta' && (
          <div className="space-y-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Procesa el cobro por <strong className="text-slate-900 font-bold">{formatearMoneda(totales.total)}</strong> en tu terminal bancaria e ingresa el número de autorización.
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

            {/* Zona de Subida de Comprobante (Opcional) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <IconPaperclip size={14} className="text-indigo-600" />
                Comprobante / Voucher de Pago <span className="text-[11px] text-slate-400 font-normal">(Opcional)</span>
              </span>

              <input
                type="file"
                ref={archivoInputRef}
                accept="image/*,.pdf"
                onChange={manejarCambioArchivo}
                className="hidden"
              />

              {!comprobante ? (
                <div
                  onClick={() => archivoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={manejarSoltarArchivo}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 rounded-2xl p-3.5 flex items-center justify-center gap-3 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <IconUpload size={18} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                      Subir comprobante o voucher
                    </p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, WEBP o PDF</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-2.5 rounded-2xl border border-indigo-200 flex items-center justify-between gap-2.5 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {comprobante.tipo.startsWith('image/') ? (
                      <img
                        src={comprobante.dataUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <IconFileText size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate" title={comprobante.nombre}>
                        {comprobante.nombre}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{comprobante.tamaño}</p>
                    </div>
                  </div>

                  <Tooltip label="Eliminar comprobante">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      radius="xl"
                      size="sm"
                      onClick={() => setComprobante(null)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel: Pago con Transferencia */}
        {metodoPago === 'transferencia' && (
          <div className="space-y-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Verifica el abono de <strong className="text-slate-900 font-bold">{formatearMoneda(totales.total)}</strong> vía SPEI / CoDi antes de confirmar la venta.
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

            {/* Zona de Subida de Comprobante (Opcional) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <IconPaperclip size={14} className="text-indigo-600" />
                Comprobante de Transferencia <span className="text-[11px] text-slate-400 font-normal">(Opcional)</span>
              </span>

              <input
                type="file"
                ref={archivoInputRef}
                accept="image/*,.pdf"
                onChange={manejarCambioArchivo}
                className="hidden"
              />

              {!comprobante ? (
                <div
                  onClick={() => archivoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={manejarSoltarArchivo}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 rounded-2xl p-3.5 flex items-center justify-center gap-3 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <IconUpload size={18} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                      Subir comprobante o captura SPEI
                    </p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, WEBP o PDF</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-2.5 rounded-2xl border border-indigo-200 flex items-center justify-between gap-2.5 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {comprobante.tipo.startsWith('image/') ? (
                      <img
                        src={comprobante.dataUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <IconFileText size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate" title={comprobante.nombre}>
                        {comprobante.nombre}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{comprobante.tamaño}</p>
                    </div>
                  </div>

                  <Tooltip label="Eliminar comprobante">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      radius="xl"
                      size="sm"
                      onClick={() => setComprobante(null)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </div>
              )}
            </div>
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
            Cancelar
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
            Completar Venta
          </Button>
        </Group>
      </div>
    </Modal>
  );
};
