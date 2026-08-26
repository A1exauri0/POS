// Servicio de datos y catalogo de productos para el POS
import categoriasIniciales from '../data/categorias.json';
import productosIniciales from '../data/productos.json';

// Categorias base predefinidas importadas desde src/data/categorias.json
export const CATEGORIAS_BASE = categoriasIniciales;

// Obtener lista de categorias desde localStorage o cargar las de categorias.json
export const obtenerCategorias = () => {
  const guardadas = localStorage.getItem('pos_categorias');
  if (!guardadas) {
    localStorage.setItem('pos_categorias', JSON.stringify(categoriasIniciales));
    return categoriasIniciales;
  }
  try {
    return JSON.parse(guardadas);
  } catch (error) {
    console.error('Error al parsear categorias:', error);
    return categoriasIniciales;
  }
};

// Guardar categorias en localStorage
export const guardarCategorias = (categorias) => {
  localStorage.setItem('pos_categorias', JSON.stringify(categorias));
};

// Array auxiliar de nombres para compatibilidad hacia atras
export const CATEGORIAS_PRODUCTOS = [
  'Todos',
  ...obtenerCategorias().map((c) => c.nombre),
];

export const PRODUCTOS_INICIALES = productosIniciales;

// Obtener todos los productos (guardados en localStorage o cargar desde productos.json)
export const obtenerProductos = () => {
  const productosGuardados = localStorage.getItem('pos_productos');
  if (!productosGuardados) {
    localStorage.setItem('pos_productos', JSON.stringify(productosIniciales));
    return productosIniciales;
  }
  try {
    return JSON.parse(productosGuardados);
  } catch (error) {
    console.error('Error al parsear productos:', error);
    return productosIniciales;
  }
};

// Guardar o actualizar la lista de productos
export const guardarProductos = (productos) => {
  localStorage.setItem('pos_productos', JSON.stringify(productos));
};

// Buscar producto por codigo de barras exacto o coincidencia de texto
export const buscarProductoPorCodigoONombre = (termino, listaProductos = obtenerProductos()) => {
  if (!termino) return null;
  const normalizado = termino.trim().toLowerCase();

  // Buscar coincidencia exacta por codigo de barras primero
  const porCodigo = listaProductos.find((p) => p.codigo.toLowerCase() === normalizado);
  if (porCodigo) return porCodigo;

  // Buscar por nombre o codigo parcial
  return listaProductos.filter(
    (p) => p.nombre.toLowerCase().includes(normalizado) || p.codigo.includes(normalizado)
  );
};
