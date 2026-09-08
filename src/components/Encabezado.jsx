import { useState, useEffect } from 'react';
import { Group, Text, Badge } from '@mantine/core';
import { IconClock, IconPointFilled } from '@tabler/icons-react';
import { formatearHora } from '../utils/formateadores';
import {
  obtenerConfiguracion,
  cargarConfiguracionBD,
} from '../services/configuracionServicio';

export const Encabezado = () => {
  const [config, setConfig] = useState(() => obtenerConfiguracion());
  const [horaActual, setHoraActual] = useState(formatearHora());

  useEffect(() => {
    cargarConfiguracionBD().then((cfg) => {
      if (cfg) setConfig(cfg);
    });

    const manejarActualizacion = (e) => {
      if (e.detail) setConfig(e.detail);
    };

    window.addEventListener('pos_configuracion_actualizada', manejarActualizacion);
    return () => window.removeEventListener('pos_configuracion_actualizada', manejarActualizacion);
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(formatearHora());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <header className="h-14 bg-slate-950 text-white px-5 flex items-center justify-between border-b border-slate-800/80 shadow-md select-none relative z-20">
      {/* Logotipo y Nombre del Negocio desde la Configuración */}
      <div className="flex items-center gap-3">
        <img
          src="/images/logo.png"
          alt="Logotipo Tienda"
          className="w-8 h-8 object-contain drop-shadow-sm shrink-0"
        />

        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-black tracking-tight text-white truncate max-w-xs sm:max-w-md">
            {config.nombreNegocio || 'Punto de Venta'}
          </h1>
        </div>
      </div>

      {/* Reloj en tiempo real */}
      <Group gap="sm">
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200 shadow-2xs">
          <IconClock size={16} className="text-indigo-400" />
          <Text size="xs" fw={700} className="font-mono tracking-wide text-slate-300">
            {horaActual}
          </Text>
        </div>
      </Group>
    </header>
  );
};
