import { useState, useEffect } from 'react';
import { TextInput, NumberInput, Button, Switch, Textarea } from '@mantine/core';
import { IconSettings, IconDeviceFloppy, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import configuracionInicial from '../../data/configuracion.json';

export const PantallaConfiguracion = () => {
  const [config, setConfig] = useState(() => {
    const guardada = localStorage.getItem('pos_configuracion');
    if (!guardada) {
      localStorage.setItem('pos_configuracion', JSON.stringify(configuracionInicial));
      return configuracionInicial;
    }
    try {
      return JSON.parse(guardada);
    } catch {
      return configuracionInicial;
    }
  });

  const [nombreNegocio, setNombreNegocio] = useState(config.nombreNegocio);
  const [rfc, setRfc] = useState(config.rfc);
  const [direccion, setDireccion] = useState(config.direccion);
  const [telefono, setTelefono] = useState(config.telefono);
  const [ivaPorcentaje, setIvaPorcentaje] = useState(config.ivaPorcentaje);
  const [mensajePieTicket, setMensajePieTicket] = useState(config.mensajePieTicket);

  const guardarConfig = () => {
    const nuevosDatos = {
      nombreNegocio,
      rfc,
      direccion,
      telefono,
      ivaPorcentaje,
      mensajePieTicket,
    };
    setConfig(nuevosDatos);
    localStorage.setItem('pos_configuracion', JSON.stringify(nuevosDatos));
    notifications.show({
      title: 'Configuración Guardada',
      message: 'Los parámetros del sistema se han actualizado correctamente.',
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <IconSettings size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Configuración del Sistema</h2>
            <p className="text-xs text-slate-500">Datos generales del negocio e impresión</p>
          </div>
        </div>

        <Button
          color="indigo"
          leftSection={<IconDeviceFloppy size={18} />}
          onClick={guardarConfig}
        >
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Datos del Negocio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Datos de la Empresa / Negocio</h3>
          
          <TextInput
            label="Nombre Comercial"
            value={nombreNegocio}
            onChange={(e) => setNombreNegocio(e.target.value)}
          />

          <TextInput
            label="RFC / Identificación Fiscal"
            value={rfc}
            onChange={(e) => setRfc(e.target.value)}
          />

          <TextInput
            label="Dirección / Sucursal"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />

          <TextInput
            label="Teléfono de Contacto"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        {/* Impuestos y Formato de Ticket */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Impuestos y Tickets</h3>

          <NumberInput
            label="Tasa de IVA General (%)"
            value={ivaPorcentaje}
            onChange={(v) => setIvaPorcentaje(typeof v === 'number' ? v : 16)}
            min={0}
            max={100}
          />

          <Textarea
            label="Mensaje al Pie del Ticket"
            rows={3}
            value={mensajePieTicket}
            onChange={(e) => setMensajePieTicket(e.target.value)}
          />

          <div className="pt-2">
            <Switch
              label="Sonido al escanear código de barras"
              defaultChecked
              color="indigo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
