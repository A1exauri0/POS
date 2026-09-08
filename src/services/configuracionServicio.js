// Servicio para gestion y persistencia de la configuracion del sistema en SQLite
import configuracionInicial from '../data/configuracion.json';
import {
  inicializarBaseDatos,
  ejecutarConsulta,
  ejecutarComando,
  esEntornoTauri,
} from './baseDatosServicio';

let cacheConfiguracion = null;

// Obtener configuracion sincrona (desde cache o localStorage)
export const obtenerConfiguracion = () => {
  if (cacheConfiguracion) {
    return cacheConfiguracion;
  }

  const guardada = localStorage.getItem('pos_configuracion');
  if (guardada) {
    try {
      cacheConfiguracion = JSON.parse(guardada);
      return cacheConfiguracion;
    } catch {
      cacheConfiguracion = configuracionInicial;
      return configuracionInicial;
    }
  }

  cacheConfiguracion = configuracionInicial;
  return configuracionInicial;
};

// Cargar configuracion desde SQLite
export const cargarConfiguracionBD = async () => {
  try {
    await inicializarBaseDatos();
    if (esEntornoTauri()) {
      const filas = await ejecutarConsulta('SELECT clave, valor FROM configuracion;');
      if (filas && filas.length > 0) {
        const configReconstruida = {};
        for (const fila of filas) {
          try {
            configReconstruida[fila.clave] = JSON.parse(fila.valor);
          } catch {
            configReconstruida[fila.clave] = fila.valor;
          }
        }

        const configFinal = { ...configuracionInicial, ...configReconstruida };
        cacheConfiguracion = configFinal;
        localStorage.setItem('pos_configuracion', JSON.stringify(configFinal));
        return configFinal;
      }
    }
  } catch (error) {
    console.warn('Error al cargar configuracion desde SQLite:', error);
  }

  return obtenerConfiguracion();
};

// Guardar configuracion en SQLite y en cache
export const guardarConfiguracionBD = async (nuevosDatos) => {
  const configFinal = { ...obtenerConfiguracion(), ...nuevosDatos };
  cacheConfiguracion = configFinal;
  localStorage.setItem('pos_configuracion', JSON.stringify(configFinal));

  if (esEntornoTauri()) {
    try {
      for (const [clave, valor] of Object.entries(configFinal)) {
        const valorString = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
        await ejecutarComando(
          `INSERT INTO configuracion (clave, valor)
           VALUES ($1, $2)
           ON CONFLICT(clave) DO UPDATE SET valor = $2;`,
          [clave, valorString]
        );
      }
    } catch (error) {
      console.error('Error al guardar configuracion en SQLite:', error);
    }
  }

  return configFinal;
};
