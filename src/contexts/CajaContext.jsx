import { createContext, useContext, useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCash } from '@tabler/icons-react';

const CajaContext = createContext(null);

export const CajaProvider = ({ children }) => {
  // Estado de la caja
  const [cajaAbierta, setCajaAbierta] = useState(() => {
    const estado = localStorage.getItem('pos_caja_abierta');
    return estado ? JSON.parse(estado) : true; // Abierta por defecto para pruebas
  });

  const [turnoActual, setTurnoActual] = useState(() => {
    const guardado = localStorage.getItem('pos_turno_actual');
    return guardado
      ? JSON.parse(guardado)
      : {
          id: 'TURNO-001',
          cajero: 'Cajero Principal',
          fechaApertura: new Date().toISOString(),
          fondoInicial: 500.0,
          movimientos: [],
        };
  });

  useEffect(() => {
    localStorage.setItem('pos_caja_abierta', JSON.stringify(cajaAbierta));
  }, [cajaAbierta]);

  useEffect(() => {
    localStorage.setItem('pos_turno_actual', JSON.stringify(turnoActual));
  }, [turnoActual]);

  const abrirCaja = (fondoInicial = 500, cajero = 'Cajero Principal') => {
    const nuevoTurno = {
      id: `TURNO-${Date.now().toString().slice(-4)}`,
      cajero,
      fechaApertura: new Date().toISOString(),
      fondoInicial,
      movimientos: [],
    };
    setTurnoActual(nuevoTurno);
    setCajaAbierta(true);

    notifications.show({
      title: 'Caja Abierta',
      message: `Fondo inicial registrado: $${fondoInicial.toFixed(2)}`,
      color: 'green',
      icon: <IconCheck size={18} />,
    });
  };

  const cerrarCaja = () => {
    setCajaAbierta(false);
    notifications.show({
      title: 'Caja Cerrada',
      message: 'El turno ha sido cerrado con éxito.',
      color: 'blue',
      icon: <IconCash size={18} />,
    });
  };

  const registrarMovimiento = (tipo, monto, concepto) => {
    const nuevoMovimiento = {
      id: `MOV-${Date.now()}`,
      tipo, // 'entrada' | 'salida'
      monto,
      concepto,
      fecha: new Date().toISOString(),
    };

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
