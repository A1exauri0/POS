import { createContext, useContext, useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCash } from '@tabler/icons-react';
import datosCajaInicial from '../data/caja.json';
import {
  obtenerEstadoCajaBD,
  abrirTurnoBD,
  cerrarTurnoBD,
  registrarMovimientoBD,
} from '../services/cajaServicio';

const CajaContext = createContext(null);

export const CajaProvider = ({ children }) => {
  const [cajaAbierta, setCajaAbierta] = useState(() => {
    const estado = localStorage.getItem('pos_caja_abierta');
    return estado !== null ? JSON.parse(estado) : datosCajaInicial.cajaAbierta;
  });

  const [turnoActual, setTurnoActual] = useState(() => {
    const guardado = localStorage.getItem('pos_turno_actual');
    try {
      return guardado ? JSON.parse(guardado) : datosCajaInicial.turnoActual;
    } catch {
      return datosCajaInicial.turnoActual;
    }
  });

  // Hidratar estado de caja desde SQLite al montar
  useEffect(() => {
    const cargarCaja = async () => {
      const estadoBD = await obtenerEstadoCajaBD();
      if (estadoBD) {
        setCajaAbierta(estadoBD.cajaAbierta);
        setTurnoActual(estadoBD.turnoActual);
      }
    };

    cargarCaja();
  }, []);

  const abrirCaja = async (fondoInicial = 500, cajero = 'Cajero Principal') => {
    const nuevoTurno = await abrirTurnoBD(fondoInicial, cajero);
    setTurnoActual(nuevoTurno);
    setCajaAbierta(true);

    notifications.show({
      title: 'Caja Abierta',
      message: `Fondo inicial registrado: $${fondoInicial.toFixed(2)}`,
      color: 'green',
      icon: <IconCheck size={18} />,
    });
  };

  const cerrarCaja = async () => {
    if (turnoActual?.id) {
      await cerrarTurnoBD(turnoActual.id);
    }
    setCajaAbierta(false);
    notifications.show({
      title: 'Caja Cerrada',
      message: 'El turno ha sido cerrado con éxito.',
      color: 'blue',
      icon: <IconCash size={18} />,
    });
  };

  const registrarMovimiento = async (tipo, monto, concepto) => {
    if (!turnoActual?.id) return;

    const nuevoMovimiento = await registrarMovimientoBD(turnoActual.id, tipo, monto, concepto);

    setTurnoActual((prev) => ({
      ...prev,
      movimientos: [nuevoMovimiento, ...(prev?.movimientos || [])],
    }));

    notifications.show({
      title: tipo === 'entrada' ? 'Entrada de Efectivo' : 'Salida de Efectivo',
      message: `$${monto.toFixed(2)} - ${concepto}`,
      color: tipo === 'entrada' ? 'teal' : 'red',
    });
  };

  return (
    <CajaContext.Provider
      value={{
        cajaAbierta,
        turnoActual,
        abrirCaja,
        cerrarCaja,
        registrarMovimiento,
      }}
    >
      {children}
    </CajaContext.Provider>
  );
};

export const useCaja = () => {
  const context = useContext(CajaContext);
  if (!context) {
    throw new Error('useCaja debe usarse dentro de un CajaProvider');
  }
  return context;
};
