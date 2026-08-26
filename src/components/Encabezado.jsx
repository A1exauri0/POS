import { useState, useEffect } from 'react';
import { Badge, Group, Text, Tooltip } from '@mantine/core';
import {
  IconBuildingStore,
  IconClock,
  IconLockOpen,
  IconLock,
  IconKeyboard,
} from '@tabler/icons-react';
import { formatearHora } from '../utils/formateadores';
import { useCaja } from '../contexts/CajaContext';

export const Encabezado = () => {
  const [horaActual, setHoraActual] = useState(formatearHora());
  const { cajaAbierta, turnoActual } = useCaja();

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(formatearHora());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <header className="h-14 bg-slate-900 text-white px-4 flex items-center justify-between border-b border-slate-800 shadow-sm select-none">
      {/* Logotipo y Nombre del Sistema */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
          <IconBuildingStore size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white leading-tight">
            Punto de Venta Local
          </h1>
          <p className="text-xs text-slate-400">Sistema Rápido de Mostrador</p>
        </div>
      </div>

      {/* Atajos de teclado rapidos informativos */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
        <IconKeyboard size={15} className="text-indigo-400" />
        <span className="text-slate-300 font-medium">Atajos:</span>
        <span className="bg-slate-700 px-1.5 py-0.5 rounded text-amber-300 font-mono font-semibold">F2</span>
        <span className="text-slate-400">Cobrar</span>
        <span className="text-slate-600">|</span>
        <span className="bg-slate-700 px-1.5 py-0.5 rounded text-cyan-300 font-mono font-semibold">F4</span>
        <span className="text-slate-400">Buscar</span>
        <span className="text-slate-600">|</span>
        <span className="bg-slate-700 px-1.5 py-0.5 rounded text-rose-300 font-mono font-semibold">ESC</span>
        <span className="text-slate-400">Cerrar</span>
      </div>

      {/* Estado de Caja y Reloj */}
      <Group gap="md">
        <Tooltip label={cajaAbierta ? 'Caja activa para ventas' : 'Caja cerrada'} withArrow>
          <Badge
            color={cajaAbierta ? 'teal' : 'red'}
            variant="filled"
            size="md"
            leftSection={cajaAbierta ? <IconLockOpen size={13} /> : <IconLock size={13} />}
          >
            {cajaAbierta ? `Caja Abierta` : 'Caja Cerrada'}
          </Badge>
        </Tooltip>

        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200">
          <IconClock size={16} className="text-indigo-400" />
          <Text size="sm" fw={600} className="font-mono">
            {horaActual}
          </Text>
        </div>
      </Group>
    </header>
  );
};
