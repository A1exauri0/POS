import { useState, useEffect } from 'react';
import { Group, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { formatearHora } from '../utils/formateadores';

export const Encabezado = () => {
  const [horaActual, setHoraActual] = useState(formatearHora());

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
        <img
          src="/images/logo.png"
          alt="Logotipo Tienda"
          className="w-9 h-9 object-contain drop-shadow-sm shrink-0"
        />

        <h1 className="text-base font-black tracking-tight text-white">
          Punto de Venta Local
        </h1>
      </div>

      {/* Reloj en tiempo real */}
      <Group gap="md">
        <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-slate-200 shadow-xs">
          <IconClock size={16} className="text-indigo-400" />
          <Text size="sm" fw={600} className="font-mono">
            {horaActual}
          </Text>
        </div>
      </Group>
    </header>
  );
};
