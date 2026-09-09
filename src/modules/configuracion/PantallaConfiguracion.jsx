import { useState, useEffect } from 'react';
import { TextInput, NumberInput, Button, Textarea } from '@mantine/core';
import {
  IconSettings,
  IconDeviceFloppy,
  IconCheck,
  IconDatabase,
  IconTrash,
  IconDatabaseImport,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  obtenerConfiguracion,
  cargarConfiguracionBD,
  guardarConfiguracionBD,
} from '../../services/configuracionServicio';
import {
  cargarDatosDemostracionBD,
  limpiarBaseDatosBD,
} from '../../services/baseDatosServicio';
import { ModalConfirmacion } from '../../components/ModalConfirmacion';

export const PantallaConfiguracion = () => {
  const [config, setConfig] = useState(() => obtenerConfiguracion());

  const [nombreNegocio, setNombreNegocio] = useState(config.nombreNegocio || '');
  const [rfc, setRfc] = useState(config.rfc || '');
  const [direccion, setDireccion] = useState(config.direccion || '');
  const [telefono, setTelefono] = useState(config.telefono || '');
  const [ivaPorcentaje, setIvaPorcentaje] = useState(config.ivaPorcentaje || 16);
  const [mensajePieTicket, setMensajePieTicket] = useState(config.mensajePieTicket || '');

  // Modales de confirmación para mantenimiento
  const [modalDemoAbierto, setModalDemoAbierto] = useState(false);
  const [modalLimpiarAbierto, setModalLimpiarAbierto] = useState(false);

  // Cargar configuracion fresca desde SQLite al montar
  useEffect(() => {
    cargarConfiguracionBD().then((cfg) => {
      if (cfg) {
        setConfig(cfg);
        setNombreNegocio(cfg.nombreNegocio || '');
        setRfc(cfg.rfc || '');
        setDireccion(cfg.direccion || '');
        setTelefono(cfg.telefono || '');
        setIvaPorcentaje(cfg.ivaPorcentaje || 16);
        setMensajePieTicket(cfg.mensajePieTicket || '');
      }
    });
  }, []);

  const guardarConfig = async () => {
    const nuevosDatos = {
      nombreNegocio,
      rfc,
      direccion,
      telefono,
      ivaPorcentaje,
      mensajePieTicket,
    };
    const configActualizada = await guardarConfiguracionBD(nuevosDatos);
    setConfig(configActualizada);
    notifications.show({
      title: 'Configuración Guardada',
      message: 'Los parámetros del sistema se han actualizado correctamente.',
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
  };

  const ejecutarCargarDemo = async () => {
    await cargarDatosDemostracionBD();
    setModalDemoAbierto(false);
    notifications.show({
      title: 'Datos Demo Cargados',
      message: 'Se cargaron los productos, clientes y ventas de demostración.',
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
    setTimeout(() => window.location.reload(), 800);
  };

  const ejecutarLimpiarBD = async () => {
    await limpiarBaseDatosBD();
    setModalLimpiarAbierto(false);
    notifications.show({
      title: 'Base de Datos Limpia',
      message: 'Se han eliminado los datos de prueba. El sistema está listo para el cliente.',
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-y-auto">
      {/* Cabecera del modulo unificada */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
            <IconSettings size={22} stroke={2} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">Configuración del Sistema</h2>
            <p className="text-xs text-slate-500 font-medium">Datos generales del negocio e impresión</p>
          </div>
        </div>

        <Button
          color="indigo"
          radius="xl"
          size="sm"
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={guardarConfig}
          className="font-bold shadow-md shadow-indigo-500/15"
        >
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Datos del Negocio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Datos de la Empresa / Negocio</h3>
          
          <TextInput
            label="Nombre Comercial"
            value={nombreNegocio}
            onChange={(e) => setNombreNegocio(e.target.value)}
            radius="lg"
          />

          <TextInput
            label="RFC / Identificación Fiscal"
            value={rfc}
            onChange={(e) => setRfc(e.target.value)}
            radius="lg"
          />

          <TextInput
            label="Dirección / Sucursal"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            radius="lg"
          />

          <TextInput
            label="Teléfono de Contacto"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            radius="lg"
          />
        </div>

        {/* Impuestos y Formato de Ticket */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Impuestos y Tickets</h3>

          <NumberInput
            label="Tasa de IVA General (%)"
            value={ivaPorcentaje}
            onChange={(v) => setIvaPorcentaje(typeof v === 'number' ? v : 16)}
            min={0}
            max={100}
            radius="lg"
          />

          <Textarea
            label="Mensaje al Pie del Ticket"
            rows={8}
            value={mensajePieTicket}
            onChange={(e) => setMensajePieTicket(e.target.value)}
            radius="lg"
          />
        </div>

        {/* Mantenimiento de Base de Datos y Modo Demo */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <IconDatabase size={18} className="text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">Mantenimiento de Base de Datos</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800">Cargar Datos de Demostración</p>
                <p className="text-xs text-slate-500 mt-1">
                  Inserta catálogo completo con productos, clientes y ventas de prueba para demostrar el sistema a un cliente.
                </p>
              </div>
              <Button
                variant="light"
                color="indigo"
                radius="lg"
                size="xs"
                leftSection={<IconDatabaseImport size={15} />}
                onClick={() => setModalDemoAbierto(true)}
              >
                Cargar Catálogo Demo
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-red-100 bg-red-50/40 flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-red-900">Limpiar Base de Datos (Modo Cliente)</p>
                <p className="text-xs text-slate-500 mt-1">
                  Elimina todos los productos de prueba y ventas ficticias para dejar el sistema 100% limpio y listo para operar.
                </p>
              </div>
              <Button
                variant="light"
                color="red"
                radius="lg"
                size="xs"
                leftSection={<IconTrash size={15} />}
                onClick={() => setModalLimpiarAbierto(true)}
              >
                Vaciar Datos de Prueba
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales de Confirmación */}
      <ModalConfirmacion
        abierto={modalDemoAbierto}
        alCerrar={() => setModalDemoAbierto(false)}
        alConfirmar={ejecutarCargarDemo}
        titulo="¿Cargar datos de demostración?"
        mensaje="Esto agregará los productos, clientes y ventas de prueba para demostración."
        textoConfirmar="Sí, Cargar Demo"
        colorConfirmar="indigo"
      />

      <ModalConfirmacion
        abierto={modalLimpiarAbierto}
        alCerrar={() => setModalLimpiarAbierto(false)}
        alConfirmar={ejecutarLimpiarBD}
        titulo="¿Limpiar base de datos para entrega?"
        mensaje="Se eliminarán todos los productos de prueba, ventas e historial. Solo se conservará la configuración del negocio."
        textoConfirmar="Sí, Limpiar Todo"
        colorConfirmar="red"
      />
    </div>
  );
};
