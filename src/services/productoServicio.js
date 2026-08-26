// Servicio de datos y catalogo de productos para el POS

// Categorias base predefinidas en el sistema
export const CATEGORIAS_BASE = [
  {
    id: 'cat-1',
    nombre: 'Bebidas',
    color: 'blue',
    descripcion: 'Refrescos, aguas purificadas, jugos y bebidas energéticas',
  },
  {
    id: 'cat-2',
    nombre: 'Abarrotes',
    color: 'teal',
    descripcion: 'Granos, aceites, pastas, azúcar, harina y abarrotes generales',
  },
  {
    id: 'cat-3',
    nombre: 'Snacks',
    color: 'yellow',
    descripcion: 'Papas, galletas, botanas saladas y dulces',
  },
  {
    id: 'cat-4',
    nombre: 'Lácteos',
    color: 'indigo',
    descripcion: 'Leches, quesos, cremas, mantequillas y yogures',
  },
  {
    id: 'cat-5',
    nombre: 'Panadería',
    color: 'orange',
    descripcion: 'Pan de caja, bolillos, pan dulce y repostería',
  },
  {
    id: 'cat-6',
    nombre: 'Limpieza',
    color: 'cyan',
    descripcion: 'Detergentes, suavizantes, cloro, jabones y desinfectantes',
  },
  {
    id: 'cat-7',
    nombre: 'Cuidado Personal',
    color: 'pink',
    descripcion: 'Shampoo, jabones de tocador, pasta dental y desodorantes',
  },
];

// Obtener lista de categorias desde localStorage o cargar las iniciales
export const obtenerCategorias = () => {
  const guardadas = localStorage.getItem('pos_categorias');
  if (!guardadas) {
    localStorage.setItem('pos_categorias', JSON.stringify(CATEGORIAS_BASE));
    return CATEGORIAS_BASE;
  }
  try {
    return JSON.parse(guardadas);
  } catch (error) {
    console.error('Error al parsear categorias:', error);
    return CATEGORIAS_BASE;
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

export const PRODUCTOS_INICIALES = [
  {
    id: 'prod-001',
    codigo: '7501055300075',
    nombre: 'Coca Cola Original 600ml',
    categoria: 'Bebidas',
    precio: 19.50,
    costo: 14.00,
    stock: 48,
    unidad: 'Pza',
    colorCategoria: 'red',
  },
  {
    id: 'prod-002',
    codigo: '7501031311309',
    nombre: 'Agua Purificada Bonafont 1L',
    categoria: 'Bebidas',
    precio: 14.00,
    costo: 8.50,
    stock: 35,
    unidad: 'Pza',
    colorCategoria: 'blue',
  },
  {
    id: 'prod-003',
    codigo: '7501000111209',
    nombre: 'Papas Sabritas Sal 45g',
    categoria: 'Snacks',
    precio: 22.00,
    costo: 16.00,
    stock: 24,
    unidad: 'Pza',
    colorCategoria: 'yellow',
  },
  {
    id: 'prod-004',
    codigo: '7501000128504',
    nombre: 'Galletas Chokis Clásicas 84g',
    categoria: 'Snacks',
    precio: 18.50,
    costo: 13.20,
    stock: 19,
    unidad: 'Pza',
    colorCategoria: 'yellow',
  },
  {
    id: 'prod-005',
    codigo: '7501020513653',
    nombre: 'Leche Entera Lala 1L',
    categoria: 'Lácteos',
    precio: 28.50,
    costo: 23.00,
    stock: 15,
    unidad: 'Pza',
    colorCategoria: 'indigo',
  },
  {
    id: 'prod-006',
    codigo: '7501000153100',
    nombre: 'Pan de Caja Bimbo Blanco Grande',
    categoria: 'Panadería',
    precio: 47.00,
    costo: 38.00,
    stock: 12,
    unidad: 'Pza',
    colorCategoria: 'orange',
  },
  {
    id: 'prod-007',
    codigo: '7501030467540',
    nombre: 'Arroz Verde Valle Super Extra 1kg',
    categoria: 'Abarrotes',
    precio: 34.00,
    costo: 26.50,
    stock: 40,
    unidad: 'Pza',
    colorCategoria: 'teal',
  },
  {
    id: 'prod-008',
    codigo: '7501030491026',
    nombre: 'Frijol Negro Verde Valle 1kg',
    categoria: 'Abarrotes',
    precio: 39.50,
    costo: 31.00,
    stock: 28,
    unidad: 'Pza',
    colorCategoria: 'teal',
  },
  {
    id: 'prod-009',
    codigo: '7501025401344',
    nombre: 'Aceite Nutrioli Puro de Soya 850ml',
    categoria: 'Abarrotes',
    precio: 42.00,
    costo: 33.50,
    stock: 18,
    unidad: 'Pza',
    colorCategoria: 'teal',
  },
  {
    id: 'prod-010',
    codigo: '7501025409890',
    nombre: 'Detergente Ariel Doble Poder 1kg',
    categoria: 'Limpieza',
    precio: 45.00,
    costo: 34.00,
    stock: 14,
    unidad: 'Pza',
    colorCategoria: 'cyan',
  },
  {
    id: 'prod-011',
    codigo: '7501025405520',
    nombre: 'Jabón Zote Rosa 400g',
    categoria: 'Limpieza',
    precio: 21.00,
    costo: 15.00,
    stock: 30,
    unidad: 'Pza',
    colorCategoria: 'cyan',
  },
  {
    id: 'prod-012',
    codigo: '7501001155909',
    nombre: 'Café Nescafé Clásico 120g',
    categoria: 'Abarrotes',
    precio: 68.00,
    costo: 52.00,
    stock: 9,
    unidad: 'Pza',
    colorCategoria: 'teal',
  },
];

// Obtener todos los productos (guardados en localStorage para persistencia temporal)
export const obtenerProductos = () => {
  const productosGuardados = localStorage.getItem('pos_productos');
  if (!productosGuardados) {
    localStorage.setItem('pos_productos', JSON.stringify(PRODUCTOS_INICIALES));
    return PRODUCTOS_INICIALES;
  }
  try {
    return JSON.parse(productosGuardados);
  } catch (error) {
    console.error('Error al parsear productos:', error);
    return PRODUCTOS_INICIALES;
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
