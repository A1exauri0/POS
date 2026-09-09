// Servicio para gestion y persistencia de turnos y movimientos de caja en SQLite
import datosCajaInicial from '../data/caja.json';
import {
  inicializarBaseDatos,
  ejecutarConsulta,
  ejecutarComando,
  esEntornoTauri,
} from './baseDatosServicio';

// Obtener estado actual de la caja y turno activo desde SQLite
export const obtenerEstadoCajaBD = async () => {
  try {
    await inicializarBaseDatos();
    if (esEntornoTauri()) {
      // Buscar turno abierto mas reciente
      const turnos = await ejecutarConsulta(
        `SELECT id, cajero, fecha_apertura as fechaApertura, fecha_cierre as fechaCierre, fondo_inicial as fondoInicial, estado
         FROM turnos_caja
         WHERE estado = 'abierto'
         ORDER BY fecha_apertura DESC
         LIMIT 1;`
      );

      if (turnos && turnos.length > 0) {
        const turno = turnos[0];
        // Cargar movimientos asociados a este turno
        const movimientos = await ejecutarConsulta(
          `SELECT id, tipo, monto, concepto, fecha
           FROM movimientos_caja
           WHERE turno_id = $1
           ORDER BY fecha DESC;`,
          [turno.id]
        );

        return {
          cajaAbierta: true,
          turnoActual: {
            ...turno,
            movimientos: movimientos || [],
          },
        };
      } else {
        // No hay turno abierto
        return {
          cajaAbierta: false,
          turnoActual: null,
        };
      }
    }
  } catch (error) {
    console.warn('Error al obtener estado de caja desde SQLite:', error);
  }

  // Respaldo en localStorage
  const estadoGuardado = localStorage.getItem('pos_caja_abierta');
  const turnoGuardado = localStorage.getItem('pos_turno_actual');

  return {
    cajaAbierta: estadoGuardado !== null ? JSON.parse(estadoGuardado) : false,
    turnoActual: turnoGuardado ? JSON.parse(turnoGuardado) : null,
  };
};

// Abrir un nuevo turno de caja en SQLite
export const abrirTurnoBD = async (fondoInicial = 500, cajero = 'Cajero Principal') => {
  const nuevoTurno = {
    id: `TURNO-${Date.now().toString().slice(-4)}`,
    cajero,
    fechaApertura: new Date().toISOString(),
    fondoInicial,
    movimientos: [],
  };

  localStorage.setItem('pos_caja_abierta', JSON.stringify(true));
  localStorage.setItem('pos_turno_actual', JSON.stringify(nuevoTurno));

  if (esEntornoTauri()) {
    try {
      await ejecutarComando(
        `INSERT INTO turnos_caja (id, cajero, fecha_apertura, fondo_inicial, estado)
         VALUES ($1, $2, $3, $4, 'abierto');`,
        [nuevoTurno.id, nuevoTurno.cajero, nuevoTurno.fechaApertura, nuevoTurno.fondoInicial]
      );
    } catch (error) {
      console.error('Error al abrir turno en SQLite:', error);
    }
  }

  return nuevoTurno;
};

// Cerrar turno de caja en SQLite
export const cerrarTurnoBD = async (turnoId) => {
  localStorage.setItem('pos_caja_abierta', JSON.stringify(false));

  if (esEntornoTauri() && turnoId) {
    try {
      await ejecutarComando(
        `UPDATE turnos_caja
         SET estado = 'cerrado', fecha_cierre = $1
         WHERE id = $2;`,
        [new Date().toISOString(), turnoId]
      );
    } catch (error) {
      console.error('Error al cerrar turno en SQLite:', error);
    }
  }
};

// Registrar movimiento de entrada o salida de efectivo en SQLite
export const registrarMovimientoBD = async (turnoId, tipo, monto, concepto) => {
  const nuevoMovimiento = {
    id: `MOV-${Date.now()}`,
    tipo,
    monto,
    concepto,
    fecha: new Date().toISOString(),
  };

  if (esEntornoTauri() && turnoId) {
    try {
      await ejecutarComando(
        `INSERT INTO movimientos_caja (id, turno_id, tipo, monto, concepto, fecha)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [nuevoMovimiento.id, turnoId, tipo, monto, concepto, nuevoMovimiento.fecha]
      );
    } catch (error) {
      console.error('Error al registrar movimiento en SQLite:', error);
    }
  }

  return nuevoMovimiento;
};
