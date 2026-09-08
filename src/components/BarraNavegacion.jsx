import { Tooltip } from '@mantine/core';
import {
  IconLayoutDashboard,
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
      id: 'dashboard',
      etiqueta: 'Panel de Control (Dashboard)',
      icono: IconLayoutDashboard,
    },
    {
      id: 'ventas',
      etiqueta: 'Punto de Venta',
      icono: IconShoppingCart,
    },
    {
      id: 'inventario',
      etiqueta: 'Inventario y Productos',
      icono: IconPackage,
    },
    {
      id: 'clientes',
      etiqueta: 'Catálogo de Clientes',
      icono: IconUsers,
    },
    {
      id: 'caja',
      etiqueta: 'Caja y Turnos',
      icono: IconCashRegister,
    },
    {
      id: 'reportes',
      etiqueta: 'Historial y Reportes',
      icono: IconChartBar,
    },
  ];

  return (
    <aside className="w-18 bg-slate-950 border-r border-slate-800/80 flex flex-col items-center justify-between py-4 select-none shrink-0 relative z-10 shadow-lg">
      {/* Botones de módulos principales */}
      <div className="flex flex-col items-center gap-2.5 w-full px-2">
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
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer relative group ${
                  estaActivo
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35 scale-105 ring-2 ring-indigo-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                }`}
              >
                <Icono size={22} stroke={estaActivo ? 2.2 : 1.8} />

                {/* Pequeña barra indicadora activa lateral */}
                {estaActivo && (
                  <span className="absolute -left-2 w-1.5 h-6 bg-indigo-500 rounded-r-full" />
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Botón de configuración al final */}
      <div className="w-full px-2">
        <Tooltip label="Configuración" position="right" withArrow>
          <button
            type="button"
            onClick={() => setVistaActiva('configuracion')}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer relative mx-auto ${
              vistaActiva === 'configuracion'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35 ring-2 ring-indigo-400/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
            }`}
          >
            <IconSettings size={22} stroke={vistaActiva === 'configuracion' ? 2.2 : 1.8} />
            {vistaActiva === 'configuracion' && (
              <span className="absolute -left-2 w-1.5 h-6 bg-indigo-500 rounded-r-full" />
            )}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
