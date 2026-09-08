import { useMemo } from 'react';
import { formatearMoneda, formatearFechaHora } from '../../../utils/formateadores';
import { obtenerConfiguracion } from '../../../services/configuracionServicio';

export const TicketImpresion = ({ venta, configuracion }) => {
  const config = useMemo(() => configuracion || obtenerConfiguracion(), [configuracion]);

  if (!venta) return null;

  const articulos = venta.articulos || [];
  const esEfectivo = venta.pago?.metodo === 'efectivo';
  const totalArticulos = venta.totales?.totalArticulos || articulos.reduce((s, a) => s + (a.cantidad || 0), 0);
  const subtotalNeto = venta.totales?.subtotalNeto || (venta.totales?.total ? venta.totales.total / 1.16 : 0);
  const impuestos = venta.totales?.impuestos || (venta.totales?.total ? venta.totales.total - subtotalNeto : 0);

  return (
    <div
      id="seccion-ticket-impresion"
      className="ticket-impresion-contenedor text-slate-900 bg-white p-4 text-[12px] font-mono leading-tight tracking-tight select-text w-full max-w-[80mm] mx-auto border border-slate-200 rounded-xl shadow-xs"
    >
      {/* 1. ENCABEZADO DE LA EMPRESA */}
      <div className="text-center space-y-0.5 pb-2">
        <h1 className="text-sm font-black uppercase tracking-normal m-0 text-slate-900">
          {config.nombreNegocio || 'MI TIENDA POS'}
        </h1>
        {config.rfc && <p className="text-[11px] font-bold text-slate-700">RFC: {config.rfc}</p>}
        {config.direccion && <p className="text-[10px] text-slate-600">{config.direccion}</p>}
        {config.telefono && <p className="text-[10px] text-slate-600">Tel: {config.telefono}</p>}
      </div>

      {/* SEPARADOR */}
      <div className="border-t border-dashed border-slate-400 my-1.5" />

      {/* 2. DATOS DE LA TRANSACCIÓN */}
      <div className="text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span className="font-bold">FOLIO:</span>
          <span className="font-black">{venta.id}</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-700">
          <span>FECHA:</span>
          <span>{formatearFechaHora(venta.fecha)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-700">
          <span>CLIENTE:</span>
          <span className="truncate max-w-[160px] text-right">
            {venta.cliente?.nombre || 'Público General'}
          </span>
        </div>
      </div>

      {/* SEPARADOR */}
      <div className="border-t border-dashed border-slate-400 my-1.5" />

      {/* 3. TABLA DE ARTÍCULOS */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-slate-700 border-b border-slate-300 pb-0.5">
          <span className="w-10">CANT</span>
          <span className="flex-1 text-left px-1">DESCRIPCIÓN</span>
          <span className="w-14 text-right">TOTAL</span>
        </div>

        {articulos.map((art, idx) => (
          <div key={art.id || idx} className="text-[11px] pt-0.5">
            <p className="font-semibold text-slate-900 leading-snug break-words">
              {art.nombre}
            </p>
            <div className="flex justify-between items-center text-[10px] text-slate-600 pl-2">
              <span>
                {art.cantidad} x {formatearMoneda(art.precio)}
              </span>
              <span className="font-bold font-mono text-slate-900 text-[11px]">
                {formatearMoneda(art.subtotal)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SEPARADOR */}
      <div className="border-t border-dashed border-slate-400 my-2" />

      {/* 4. TOTALES Y DESGLOSE */}
      <div className="space-y-0.5 text-[11px]">
        <div className="flex justify-between text-[10px] text-slate-600">
          <span>Total Artículos:</span>
          <span className="font-bold font-mono">{totalArticulos} pza(s)</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-600">
          <span>Subtotal (Gravable):</span>
          <span className="font-mono">{formatearMoneda(subtotalNeto)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-600">
          <span>IVA (16%):</span>
          <span className="font-mono">{formatearMoneda(impuestos)}</span>
        </div>

        <div className="border-t border-slate-800 pt-1 mt-1 flex justify-between items-baseline">
          <span className="text-xs font-black uppercase tracking-wider">TOTAL A PAGAR:</span>
          <span className="text-base font-black font-mono">
            {formatearMoneda(venta.totales?.total || 0)}
          </span>
        </div>
      </div>

      {/* SEPARADOR */}
      <div className="border-t border-dashed border-slate-400 my-2" />

      {/* 5. DETALLE DEL PAGO */}
      <div className="text-[10.5px] space-y-0.5 text-slate-700">
        <div className="flex justify-between font-bold text-slate-900">
          <span>FORMA DE PAGO:</span>
          <span className="uppercase">{venta.pago?.metodo || 'EFECTIVO'}</span>
        </div>

        {esEfectivo ? (
          <>
            <div className="flex justify-between">
              <span>Monto Recibido:</span>
              <span className="font-mono">{formatearMoneda(venta.pago?.montoRecibido || venta.totales?.total || 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span>Cambio Entregado:</span>
              <span className="font-mono">{formatearMoneda(venta.pago?.cambio || 0)}</span>
            </div>
          </>
        ) : (
          <>
            {venta.pago?.referencia && (
              <div className="flex justify-between">
                <span>Ref / Auth:</span>
                <span className="font-mono font-bold">{venta.pago.referencia}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* SEPARADOR */}
      <div className="border-t border-dashed border-slate-400 my-2.5" />

      {/* 6. PIE Y AGRADECIMIENTO */}
      <div className="text-center space-y-1 text-[10px] text-slate-600 pt-0.5">
        <p className="font-bold text-slate-800 text-[11px]">
          {config.mensajePieTicket || '¡Gracias por su compra! Vuelva pronto.'}
        </p>
        <p className="text-[9px] text-slate-400 uppercase">
          Comprobante simplificado de venta
        </p>
        <div className="pt-1 font-mono text-[9px] tracking-widest text-slate-400">
          *** {venta.id} ***
        </div>
      </div>
    </div>
  );
};
