import { ActionIcon, Tooltip } from '@mantine/core';
import { IconMinus, IconPlus, IconTrash, IconPercentage } from '@tabler/icons-react';
import { formatearMoneda } from '../../../utils/formateadores';
import { useVenta } from '../../../contexts/VentaContext';

export const ItemTicket = ({ item }) => {
  const { cambiarCantidad, eliminarArticulo, aplicarDescuento } = useVenta();

  const manejarCambioDescuento = () => {
    const nuevoDescuento = window.prompt(
      `Ingresa el porcentaje de descuento (0 a 100) para: ${item.nombre}`,
      item.descuento || 0
    );
    if (nuevoDescuento !== null) {
      const porcentaje = parseFloat(nuevoDescuento);
      if (!isNaN(porcentaje)) {
        aplicarDescuento(item.id, porcentaje);
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-2xs group">
      {/* Informacion basica del producto */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-xs font-semibold text-slate-800 truncate" title={item.nombre}>
          {item.nombre}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-slate-500 font-medium">
            {formatearMoneda(item.precio)} / {item.unidad}
          </span>
          {item.descuento > 0 && (
            <span className="text-[10px] bg-rose-50 text-rose-600 font-semibold px-1.5 py-0.2 rounded border border-rose-200">
              -{item.descuento}%
            </span>
          )}
        </div>
      </div>

      {/* Control de Cantidad (Stepper) */}
      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
        >
          <IconMinus size={13} stroke={2.5} />
        </button>

        <span className="w-8 text-center text-xs font-bold text-slate-800 font-mono">
          {item.cantidad}
        </span>

        <button
          type="button"
          onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
        >
          <IconPlus size={13} stroke={2.5} />
        </button>
      </div>

      {/* Subtotal del articulo */}
      <div className="w-20 text-right shrink-0 px-2">
        <span className="text-xs font-extrabold text-slate-900 font-mono">
          {formatearMoneda(item.subtotal)}
        </span>
      </div>

      {/* Acciones (Descuento y Eliminar) */}
      <div className="flex items-center gap-1 shrink-0">
        <Tooltip label="Aplicar descuento (%)" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={manejarCambioDescuento}
            className="hover:text-indigo-600"
          >
            <IconPercentage size={15} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Eliminar producto" withArrow>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => eliminarArticulo(item.id)}
            className="hover:bg-rose-50"
          >
            <IconTrash size={15} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
};
