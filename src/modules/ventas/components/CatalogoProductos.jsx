import { IconAlertTriangle, IconPhoto } from '@tabler/icons-react';
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
    <div className="flex-1 overflow-y-auto px-1.5 pt-3 pb-3">
      {/* Rejilla fija de 4 Cards por fila */}
      <div className="grid grid-cols-4 gap-3.5">
        {productos.map((producto) => {
          const sinStock = producto.stock <= 0;
          const tieneImagen = Boolean(producto.imagen && producto.imagen.trim());

          return (
            <button
              key={producto.id}
              type="button"
              disabled={sinStock}
              onClick={() => agregarProducto(producto, 1)}
              className={`group relative flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none aspect-square ${
                sinStock
                  ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                  : 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-md hover:-translate-y-1 active:scale-98'
              }`}
            >
              {/* 1. Imagen Horizontal (Landscape) */}
              <div className="w-full aspect-[16/10] shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative group-hover:bg-slate-100/70 transition-colors">
                {tieneImagen ? (
                  <>
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icono-foto');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="fallback-icono-foto hidden w-full h-full flex items-center justify-center text-slate-300">
                      <IconPhoto size={30} stroke={1.5} />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <IconPhoto size={30} stroke={1.5} />
                  </div>
                )}
              </div>

              {/* 2. Informacion: Exclusivamente Nombre y Precio */}
              <div className="flex-1 flex flex-col justify-between pt-2 min-w-0 w-full">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                  {producto.nombre}
                </h3>
                <div className="mt-auto pt-1">
                  <span className="text-sm sm:text-base font-extrabold text-emerald-600 tracking-tight font-mono">
                    {formatearMoneda(producto.precio)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
