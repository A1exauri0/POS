import { Badge, Tooltip } from '@mantine/core';
import { IconPlus, IconAlertTriangle } from '@tabler/icons-react';
import { formatearMoneda } from '../../../utils/formateadores';
import { useVenta } from '../../../contexts/VentaContext';

export const CatalogoProductos = ({ productos }) => {
  const { agregarProducto } = useVenta();

  if (productos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
        <IconAlertTriangle size={48} className="text-slate-300 mb-2" />
        <p className="text-base font-semibold text-slate-600">No se encontraron productos</p>
        <p className="text-xs text-slate-400">Intenta con otro término de búsqueda o selecciona otra categoría</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {productos.map((producto) => {
          const sinStock = producto.stock <= 0;
          const stockBajo = producto.stock > 0 && producto.stock <= 10;

          return (
            <button
              key={producto.id}
              type="button"
              disabled={sinStock}
              onClick={() => agregarProducto(producto, 1)}
              className={`group relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none ${
                sinStock
                  ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                  : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 active:scale-98'
              }`}
            >
              {/* Badge de categoria y stock */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[95px]">
                  {producto.categoria}
                </span>

                <Badge
                  size="xs"
                  variant="light"
                  color={sinStock ? 'red' : stockBajo ? 'orange' : 'teal'}
                >
                  {sinStock ? 'Agotado' : `Stock: ${producto.stock}`}
                </Badge>
              </div>

              {/* Nombre del producto */}
              <div className="my-1 flex-1">
                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                  {producto.nombre}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{producto.codigo}</p>
              </div>

              {/* Precio y Boton de Agregar */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  {formatearMoneda(producto.precio)}
                </span>

                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
                  <IconPlus size={16} stroke={2.5} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
