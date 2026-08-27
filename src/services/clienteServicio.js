// Servicio para gestion y persistencia del catalogo de clientes
import clientesIniciales from '../data/clientes.json';

// Obtener la lista completa de clientes con sincronizacion automatica desde clientes.json
export const obtenerClientes = () => {
  const guardados = localStorage.getItem('pos_clientes');
  const huellaGuardada = localStorage.getItem('pos_clientes_huella');
  const huellaActual = JSON.stringify(clientesIniciales);

  if (!guardados || huellaGuardada !== huellaActual) {
    let listaFinal = [...clientesIniciales];

    if (guardados) {
      try {
        const previos = JSON.parse(guardados);
        const idsIniciales = new Set(clientesIniciales.map((c) => c.id));
        const clientesPersonalizados = previos.filter((c) => !idsIniciales.has(c.id));
        listaFinal = [...clientesIniciales, ...clientesPersonalizados];
      } catch (error) {
        console.error('Error al sincronizar clientes previos:', error);
      }
    }

    localStorage.setItem('pos_clientes', JSON.stringify(listaFinal));
    localStorage.setItem('pos_clientes_huella', huellaActual);
    return listaFinal;
  }

  try {
    return JSON.parse(guardados);
  } catch (error) {
    console.error('Error al parsear clientes:', error);
    return clientesIniciales;
  }
};

// Guardar lista actualizada de clientes
export const guardarClientes = (clientes) => {
  localStorage.setItem('pos_clientes', JSON.stringify(clientes));
};

// Obtener el cliente predeterminado (Publico General)
export const obtenerClientePredeterminado = () => {
  const lista = obtenerClientes();
  return lista.find((c) => c.esPredeterminado) || lista[0] || clientesIniciales[0];
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
