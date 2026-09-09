// Servicio de datos y catalogo de productos para el POS conectado a SQLite
import categoriasIniciales from '../data/categorias.json';
import productosIniciales from '../data/productos.json';
import {
  inicializarBaseDatos,
  ejecutarConsulta,
  ejecutarComando,
  esEntornoTauri,
} from './baseDatosServicio';

// Cache en memoria para acceso sincrono rapido
let cacheCategorias = null;
let cacheProductos = null;

const CATEGORIA_POR_DEFECTO = [
  { id: 'cat-1', nombre: 'General', color: 'blue', descripcion: 'Categoría general por defecto' },
];

// Categorias base predefinidas
export const CATEGORIAS_BASE = CATEGORIA_POR_DEFECTO;
export const PRODUCTOS_INICIALES = [];

// Obtener lista de categorias sincrona (desde cache o localStorage)
export const obtenerCategorias = () => {
  if (cacheCategorias !== null) {
    return cacheCategorias;
  }

  const guardadas = localStorage.getItem('pos_categorias');
  if (guardadas) {
    try {
      cacheCategorias = JSON.parse(guardadas);
      return cacheCategorias;
    } catch {
      cacheCategorias = CATEGORIA_POR_DEFECTO;
      return CATEGORIA_POR_DEFECTO;
    }
  }

  cacheCategorias = CATEGORIA_POR_DEFECTO;
  return CATEGORIA_POR_DEFECTO;
};

// Cargar categorias desde la base de datos SQLite
export const cargarCategoriasBD = async () => {
  try {
    await inicializarBaseDatos();
    if (esEntornoTauri()) {
      const filas = await ejecutarConsulta('SELECT id, nombre, color, descripcion FROM categorias ORDER BY nombre ASC;');
      if (Array.isArray(filas)) {
        cacheCategorias = filas.length > 0 ? filas : CATEGORIA_POR_DEFECTO;
        localStorage.setItem('pos_categorias', JSON.stringify(cacheCategorias));
        return cacheCategorias;
      }
    }
  } catch (error) {
    console.warn('Error al cargar categorias desde SQLite:', error);
  }
  return obtenerCategorias();
};

// Guardar o actualizar una categoria en SQLite y en cache
export const guardarCategoriaBD = async (categoria) => {
  const listaActual = obtenerCategorias();
  const existe = listaActual.some((c) => c.id === categoria.id);

  let nuevaLista;
  if (existe) {
    nuevaLista = listaActual.map((c) => (c.id === categoria.id ? categoria : c));
  } else {
    nuevaLista = [...listaActual, categoria];
  }

  cacheCategorias = nuevaLista;
  localStorage.setItem('pos_categorias', JSON.stringify(nuevaLista));

  if (esEntornoTauri()) {
    try {
      if (existe) {
        await ejecutarComando(
          'UPDATE categorias SET nombre = $1, color = $2, descripcion = $3 WHERE id = $4;',
          [categoria.nombre, categoria.color || 'blue', categoria.descripcion || '', categoria.id]
        );
      } else {
        await ejecutarComando(
          'INSERT INTO categorias (id, nombre, color, descripcion) VALUES ($1, $2, $3, $4);',
          [categoria.id, categoria.nombre, categoria.color || 'blue', categoria.descripcion || '']
        );
      }
    } catch (error) {
      console.error('Error al guardar categoria en SQLite:', error);
    }
  }

  return nuevaLista;
};

// Eliminar una categoria en SQLite y en cache
export const eliminarCategoriaBD = async (categoriaId) => {
  const listaActual = obtenerCategorias();
  const nuevaLista = listaActual.filter((c) => c.id !== categoriaId);

  cacheCategorias = nuevaLista;
  localStorage.setItem('pos_categorias', JSON.stringify(nuevaLista));

  if (esEntornoTauri()) {
    try {
      await ejecutarComando('DELETE FROM categorias WHERE id = $1;', [categoriaId]);
    } catch (error) {
      console.error('Error al eliminar categoria de SQLite:', error);
    }
  }

  return nuevaLista;
};

// Guardar array completo de categorias
export const guardarCategorias = (categorias) => {
  cacheCategorias = categorias;
  localStorage.setItem('pos_categorias', JSON.stringify(categorias));

  if (esEntornoTauri()) {
    // Sincronizar en segundo plano
    (async () => {
      for (const cat of categorias) {
        await ejecutarComando(
          'INSERT INTO categorias (id, nombre, color, descripcion) VALUES ($1, $2, $3, $4) ON CONFLICT(id) DO UPDATE SET nombre = $2, color = $3, descripcion = $4;',
          [cat.id, cat.nombre, cat.color || 'blue', cat.descripcion || '']
        );
      }
    })();
  }
};

// Array auxiliar de nombres para compatibilidad hacia atras
export const CATEGORIAS_PRODUCTOS = [
  'Todos',
  ...obtenerCategorias().map((c) => c.nombre),
];

// Obtener todos los productos de forma sincrona (desde cache o localStorage)
export const obtenerProductos = () => {
  if (cacheProductos !== null) {
    return cacheProductos;
  }

  const guardados = localStorage.getItem('pos_productos');
  if (guardados) {
    try {
      cacheProductos = JSON.parse(guardados);
      return cacheProductos;
    } catch {
      cacheProductos = [];
      return [];
    }
  }

  cacheProductos = [];
  return [];
};

// Cargar productos desde SQLite
export const cargarProductosBD = async () => {
  try {
    await inicializarBaseDatos();
    if (esEntornoTauri()) {
      const filas = await ejecutarConsulta(
        'SELECT id, codigo, nombre, categoria, precio, costo, stock, unidad, imagen, fecha_creacion FROM productos ORDER BY rowid ASC;'
      );
      if (Array.isArray(filas)) {
        cacheProductos = filas;
        localStorage.setItem('pos_productos', JSON.stringify(filas));
        return filas;
      }
    }
  } catch (error) {
    console.warn('Error al cargar productos desde SQLite:', error);
  }
  return obtenerProductos();
};

// Guardar o actualizar un producto individual en SQLite
export const guardarProductoBD = async (producto) => {
  const listaActual = obtenerProductos();
  const existe = listaActual.some((p) => p.id === producto.id);

  let nuevaLista;
  if (existe) {
    nuevaLista = listaActual.map((p) => (p.id === producto.id ? producto : p));
  } else {
    nuevaLista = [producto, ...listaActual];
  }

  cacheProductos = nuevaLista;
  localStorage.setItem('pos_productos', JSON.stringify(nuevaLista));

  if (esEntornoTauri()) {
    try {
      if (existe) {
        await ejecutarComando(
          `UPDATE productos SET
            codigo = $1, nombre = $2, categoria = $3, precio = $4,
            costo = $5, stock = $6, unidad = $7, imagen = $8
          WHERE id = $9;`,
          [
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.precio,
            producto.costo || 0,
            producto.stock || 0,
            producto.unidad || 'Pza',
            producto.imagen || '',
            producto.id,
          ]
        );
      } else {
        await ejecutarComando(
          `INSERT INTO productos (
            id, codigo, nombre, categoria, precio, costo, stock, unidad, imagen, fecha_creacion
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
          [
            producto.id,
            producto.codigo,
            producto.nombre,
            producto.categoria,
            producto.precio,
            producto.costo || 0,
            producto.stock || 0,
            producto.unidad || 'Pza',
            producto.imagen || '',
            new Date().toISOString(),
          ]
        );
      }
    } catch (error) {
      console.error('Error al guardar producto en SQLite:', error);
    }
  }

  return nuevaLista;
};

// Eliminar un producto en SQLite y en cache
export const eliminarProductoBD = async (productoId) => {
  const listaActual = obtenerProductos();
  const nuevaLista = listaActual.filter((p) => p.id !== productoId);

  cacheProductos = nuevaLista;
  localStorage.setItem('pos_productos', JSON.stringify(nuevaLista));

  if (esEntornoTauri()) {
    try {
      await ejecutarComando('DELETE FROM productos WHERE id = $1;', [productoId]);
    } catch (error) {
      console.error('Error al eliminar producto en SQLite:', error);
    }
  }

  return nuevaLista;
};

// Guardar array completo de productos
export const guardarProductos = (productos) => {
  cacheProductos = productos;
  localStorage.setItem('pos_productos', JSON.stringify(productos));

  if (esEntornoTauri()) {
    (async () => {
      for (const prod of productos) {
        await ejecutarComando(
          `INSERT INTO productos (
            id, codigo, nombre, categoria, precio, costo, stock, unidad, imagen, fecha_creacion
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT(id) DO UPDATE SET
            codigo = $2, nombre = $3, categoria = $4, precio = $5,
            costo = $6, stock = $7, unidad = $8, imagen = $9;`,
          [
            prod.id,
            prod.codigo,
            prod.nombre,
            prod.categoria,
            prod.precio,
            prod.costo || 0,
            prod.stock || 0,
            prod.unidad || 'Pza',
            prod.imagen || '',
            new Date().toISOString(),
          ]
        );
      }
    })();
  }
};

// Descontar stock tras una venta directamente en la base de datos
export const descontarStockBD = async (articulosVendidos) => {
  const productosActuales = obtenerProductos();
  const productosActualizados = productosActuales.map((p) => {
    const vendido = articulosVendidos.find((art) => art.id === p.id);
    if (vendido) {
      return {
        ...p,
        stock: Math.max(0, p.stock - vendido.cantidad),
      };
    }
    return p;
  });

  cacheProductos = productosActualizados;
  localStorage.setItem('pos_productos', JSON.stringify(productosActualizados));

  if (esEntornoTauri()) {
    try {
      for (const art of articulosVendidos) {
        await ejecutarComando(
          'UPDATE productos SET stock = MAX(0, stock - $1) WHERE id = $2;',
          [art.cantidad, art.id]
        );
      }
    } catch (error) {
      console.error('Error al descontar stock en SQLite:', error);
    }
  }

  return productosActualizados;
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
