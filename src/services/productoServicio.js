// Servicio de datos y catalogo de productos para el POS
import categoriasIniciales from '../data/categorias.json';
import productosIniciales from '../data/productos.json';

// Categorias base predefinidas importadas desde src/data/categorias.json
export const CATEGORIAS_BASE = categoriasIniciales;

// Obtener lista de categorias con sincronizacion automatica de cambios en categorias.json
export const obtenerCategorias = () => {
  const guardadas = localStorage.getItem('pos_categorias');
  const huellaGuardada = localStorage.getItem('pos_categorias_huella');
  const huellaActual = JSON.stringify(categoriasIniciales);

  // Si no hay datos guardados o si se edito categorias.json manualmente
  if (!guardadas || huellaGuardada !== huellaActual) {
    localStorage.setItem('pos_categorias', JSON.stringify(categoriasIniciales));
    localStorage.setItem('pos_categorias_huella', huellaActual);
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

// Obtener todos los productos con sincronizacion automatica de orden, cambios y rutas de productos.json
export const obtenerProductos = () => {
  const productosGuardados = localStorage.getItem('pos_productos');
  const huellaGuardada = localStorage.getItem('pos_productos_huella');
  const huellaActual = JSON.stringify(productosIniciales);

  // Si no hay datos o si productos.json cambio (orden, nombres, codigos, imagenes, etc.)
  if (!productosGuardados || huellaGuardada !== huellaActual) {
    let listaFinal = [...productosIniciales];

    // Preservar productos creados de forma manual en el CRUD de la aplicacion
    if (productosGuardados) {
      try {
        const previos = JSON.parse(productosGuardados);
        const idsIniciales = new Set(productosIniciales.map((p) => p.id));
        const productosPersonalizados = previos.filter((p) => !idsIniciales.has(p.id));
        listaFinal = [...productosIniciales, ...productosPersonalizados];
      } catch (error) {
        console.error('Error al migrar productos previos:', error);
      }
    }

    localStorage.setItem('pos_productos', JSON.stringify(listaFinal));
    localStorage.setItem('pos_productos_huella', huellaActual);
    return listaFinal;
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
