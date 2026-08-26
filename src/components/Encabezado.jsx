import { useState, useEffect } from 'react';
import { Badge, Group, Text, Tooltip } from '@mantine/core';
import {
  IconBuildingStore,
  IconClock,
  IconLockOpen,
  IconLock,
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
