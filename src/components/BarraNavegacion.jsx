import { Tooltip } from '@mantine/core';
import {
  IconShoppingCart,
  IconPackage,
  IconUsers,
  IconCashRegister,
  IconChartBar,
  IconSettings,
} from '@tabler/icons-react';

export const BarraNavegacion = ({ vistaActiva, setVistaActiva }) => {
  const modulos = [
    {
      id: 'ventas',
      etiqueta: 'Punto de Venta',
      icono: IconShoppingCart,
      color: 'bg-indigo-600 text-white',
    },
    {
      id: 'inventario',
      etiqueta: 'Inventario y Productos',
      icono: IconPackage,
      color: 'bg-emerald-600 text-white',
    },
    {
      id: 'clientes',
      etiqueta: 'Catálogo de Clientes',
      icono: IconUsers,
      color: 'bg-blue-600 text-white',
    },
    {
      id: 'caja',
      etiqueta: 'Caja y Turnos',
      icono: IconCashRegister,
      color: 'bg-amber-600 text-white',
    },
    {
      id: 'reportes',
      etiqueta: 'Historial y Reportes',
      icono: IconChartBar,
      color: 'bg-purple-600 text-white',
    },
  ];

  return (
    <aside className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center justify-between py-3 select-none shrink-0">
      {/* Botones de modulos principales */}
      <div className="flex flex-col items-center gap-3 w-full">
        {modulos.map((modulo) => {
          const Icono = modulo.icono;
          const estaActivo = vistaActiva === modulo.id;

          return (
            <Tooltip
              key={modulo.id}
              label={modulo.etiqueta}
              position="right"
              withArrow
              transitionProps={{ duration: 150 }}
            >
              <button
                type="button"
                onClick={() => setVistaActiva(modulo.id)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  estaActivo
                    ? `${modulo.color} shadow-lg shadow-indigo-500/20 scale-105`
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icono size={22} stroke={1.8} />
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Boton de configuracion al final */}
      <Tooltip label="Configuración" position="right" withArrow>
        <button
          type="button"
          onClick={() => setVistaActiva('configuracion')}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
            vistaActiva === 'configuracion'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <IconSettings size={22} stroke={1.8} />
        </button>
      </Tooltip>
    </aside>
  );
};
