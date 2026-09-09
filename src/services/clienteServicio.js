// Servicio para gestion y persistencia del catalogo de clientes conectado a SQLite
import clientesIniciales from '../data/clientes.json';
import {
  inicializarBaseDatos,
  ejecutarConsulta,
  ejecutarComando,
  esEntornoTauri,
} from './baseDatosServicio';

const CLIENTE_POR_DEFECTO = [
  { id: 'cli-1', nombre: 'Público General', telefono: 'Sin teléfono', esPredeterminado: true },
];

let cacheClientes = null;

// Obtener la lista de clientes de forma sincrona (desde cache o localStorage)
export const obtenerClientes = () => {
  if (cacheClientes !== null) {
    return cacheClientes;
  }

  const guardados = localStorage.getItem('pos_clientes');
  if (guardados) {
    try {
      cacheClientes = JSON.parse(guardados);
      return cacheClientes;
    } catch {
      cacheClientes = CLIENTE_POR_DEFECTO;
      return CLIENTE_POR_DEFECTO;
    }
  }

  cacheClientes = CLIENTE_POR_DEFECTO;
  return CLIENTE_POR_DEFECTO;
};

// Cargar clientes desde SQLite
export const cargarClientesBD = async () => {
  try {
    await inicializarBaseDatos();
    if (esEntornoTauri()) {
      const filas = await ejecutarConsulta(
        'SELECT id, nombre, telefono, es_predeterminado as esPredeterminado FROM clientes ORDER BY es_predeterminado DESC, nombre ASC;'
      );
      if (Array.isArray(filas)) {
        const formateados = (filas.length > 0 ? filas : CLIENTE_POR_DEFECTO).map((c) => ({
          ...c,
          esPredeterminado: Boolean(c.esPredeterminado),
        }));
        cacheClientes = formateados;
        localStorage.setItem('pos_clientes', JSON.stringify(formateados));
        return formateados;
      }
    }
  } catch (error) {
    console.warn('Error al cargar clientes desde SQLite:', error);
  }
  return obtenerClientes();
};

// Guardar o actualizar un cliente en SQLite
export const guardarClienteBD = async (cliente) => {
  const listaActual = obtenerClientes();
  const existe = listaActual.some((c) => c.id === cliente.id);

  let nuevaLista;
  if (existe) {
    nuevaLista = listaActual.map((c) => (c.id === cliente.id ? cliente : c));
  } else {
    nuevaLista = [...listaActual, cliente];
  }

  cacheClientes = nuevaLista;
  localStorage.setItem('pos_clientes', JSON.stringify(nuevaLista));

  if (esEntornoTauri()) {
    try {
      if (existe) {
        await ejecutarComando(
          'UPDATE clientes SET nombre = $1, telefono = $2 WHERE id = $3;',
          [cliente.nombre, cliente.telefono || 'Sin teléfono', cliente.id]
        );
      } else {
        await ejecutarComando(
          'INSERT INTO clientes (id, nombre, telefono, es_predeterminado) VALUES ($1, $2, $3, $4);',
          [cliente.id, cliente.nombre, cliente.telefono || 'Sin teléfono', cliente.esPredeterminado ? 1 : 0]
        );
      }
    } catch (error) {
      console.error('Error al guardar cliente en SQLite:', error);
    }
  }

  return nuevaLista;
};

// Eliminar un cliente de SQLite
export const eliminarClienteBD = async (clienteId) => {
  const listaActual = obtenerClientes();
  const nuevaLista = listaActual.filter((c) => c.id !== clienteId);

  cacheClientes = nuevaLista;
  localStorage.setItem('pos_clientes', JSON.stringify(nuevaLista));

  if (esEntornoTauri()) {
    try {
      await ejecutarComando('DELETE FROM clientes WHERE id = $1;', [clienteId]);
    } catch (error) {
      console.error('Error al eliminar cliente de SQLite:', error);
    }
  }

  return nuevaLista;
};

// Guardar lista completa de clientes
export const guardarClientes = (clientes) => {
  cacheClientes = clientes;
  localStorage.setItem('pos_clientes', JSON.stringify(clientes));

  if (esEntornoTauri()) {
    (async () => {
      for (const cli of clientes) {
        await ejecutarComando(
          `INSERT INTO clientes (id, nombre, telefono, es_predeterminado)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT(id) DO UPDATE SET nombre = $2, telefono = $3;`,
          [cli.id, cli.nombre, cli.telefono || 'Sin teléfono', cli.esPredeterminado ? 1 : 0]
        );
      }
    })();
  }
};

// Obtener el cliente predeterminado (Publico General)
export const obtenerClientePredeterminado = () => {
  const lista = obtenerClientes();
  return lista.find((c) => c.esPredeterminado) || lista[0] || CLIENTE_POR_DEFECTO[0];
};

// Buscar cliente por nombre o telefono
export const buscarClientes = (termino, lista = obtenerClientes()) => {
  if (!termino || !termino.trim()) return lista;
  const normalizado = termino.trim().toLowerCase();

  return lista.filter(
    (c) =>
      c.nombre.toLowerCase().includes(normalizado) ||
      (c.telefono && c.telefono.includes(normalizado))
  );
};
