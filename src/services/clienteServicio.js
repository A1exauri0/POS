// Servicio para gestion y persistencia del catalogo de clientes
import clientesIniciales from '../data/clientes.json';

// Obtener la lista completa de clientes (desde localStorage o clientes.json)
export const obtenerClientes = () => {
  const guardados = localStorage.getItem('pos_clientes');
  if (!guardados) {
    localStorage.setItem('pos_clientes', JSON.stringify(clientesIniciales));
    return clientesIniciales;
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
