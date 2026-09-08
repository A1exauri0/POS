// Servicio central de base de datos SQLite con soporte para Tauri y respaldo en localStorage para la web
import Database from '@tauri-apps/plugin-sql';
import categoriasIniciales from '../data/categorias.json';
import productosIniciales from '../data/productos.json';
import clientesIniciales from '../data/clientes.json';
import datosCajaInicial from '../data/caja.json';
import configuracionInicial from '../data/configuracion.json';
import ventasIniciales from '../data/ventas.json';

// Instancia única de la base de datos
let instanciaBD = null;
let estaInicializada = false;
let promesaInicializacion = null;

// Detectar si la aplicación se está ejecutando dentro del entorno de escritorio Tauri
export const esEntornoTauri = () => {
  return typeof window !== 'undefined' && (Boolean(window.__TAURI_INTERNALS__) || Boolean(window.__TAURI__));
};

// Inicializar base de datos SQLite (o fallback en navegador)
export const inicializarBaseDatos = async () => {
  if (estaInicializada) return instanciaBD;
  if (promesaInicializacion) return promesaInicializacion;

  promesaInicializacion = (async () => {
    try {
      if (esEntornoTauri()) {
        // Cargar o crear archivo SQLite local
        instanciaBD = await Database.load('sqlite:pos.db');

        // Crear tablas principales
        await crearTablas(instanciaBD);

        // Sembrar datos iniciales si las tablas están vacías
        await sembrarDatosIniciales(instanciaBD);
      } else {
        // En entorno web / Vercel: inicializar localStorage si está vacío
        inicializarRespaldoWeb();
      }

      estaInicializada = true;
      return instanciaBD;
    } catch (error) {
      console.warn('No se pudo conectar a SQLite nativo, usando respaldo web:', error);
      inicializarRespaldoWeb();
      estaInicializada = true;
      return null;
    }
  })();

  return promesaInicializacion;
};

// Crear tablas en SQLite
const crearTablas = async (db) => {
  // 1. Categorias
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      color TEXT DEFAULT 'blue',
      descripcion TEXT
    );
  `);

  // 2. Productos
  await db.execute(`
    CREATE TABLE IF NOT EXISTS productos (
      id TEXT PRIMARY KEY,
      codigo TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio REAL NOT NULL,
      costo REAL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      unidad TEXT DEFAULT 'Pza',
      imagen TEXT,
      fecha_creacion TEXT
    );
  `);

  // 3. Clientes
  await db.execute(`
    CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      telefono TEXT,
      es_predeterminado INTEGER DEFAULT 0
    );
  `);

  // 4. Turnos de Caja
  await db.execute(`
    CREATE TABLE IF NOT EXISTS turnos_caja (
      id TEXT PRIMARY KEY,
      cajero TEXT NOT NULL,
      fecha_apertura TEXT NOT NULL,
      fecha_cierre TEXT,
      fondo_inicial REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'abierto'
    );
  `);

  // 5. Movimientos de Caja
  await db.execute(`
    CREATE TABLE IF NOT EXISTS movimientos_caja (
      id TEXT PRIMARY KEY,
      turno_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      monto REAL NOT NULL,
      concepto TEXT NOT NULL,
      fecha TEXT NOT NULL,
      FOREIGN KEY (turno_id) REFERENCES turnos_caja(id)
    );
  `);

  // 6. Encabezado de Ventas (Tickets)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      cliente_id TEXT,
      cliente_nombre TEXT,
      cliente_telefono TEXT,
      subtotal REAL NOT NULL,
      descuento REAL DEFAULT 0,
      subtotal_neto REAL NOT NULL,
      impuestos REAL NOT NULL,
      total REAL NOT NULL,
      total_articulos INTEGER NOT NULL,
      metodo_pago TEXT NOT NULL,
      monto_recibido REAL NOT NULL,
      cambio REAL DEFAULT 0,
      referencia TEXT,
      comprobante TEXT
    );
  `);

  // Migration: add column comprobante to ventas
  try {
    await db.execute('ALTER TABLE ventas ADD COLUMN comprobante TEXT;');
  } catch {
    // La columna ya existe en la base de datos
  }

  // 7. Artículos por Venta
  await db.execute(`
    CREATE TABLE IF NOT EXISTS venta_articulos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venta_id TEXT NOT NULL,
      producto_id TEXT,
      codigo TEXT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      cantidad INTEGER NOT NULL,
      descuento REAL DEFAULT 0,
      unidad TEXT DEFAULT 'Pza',
      subtotal REAL NOT NULL,
      FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
    );
  `);

  // 8. Configuración
  await db.execute(`
    CREATE TABLE IF NOT EXISTS configuracion (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );
  `);
};

// Sembrar datos iniciales si las tablas están vacías
const sembrarDatosIniciales = async (db) => {
  // Sembrar Categorias
  const conteoCategorias = await db.select('SELECT COUNT(*) as total FROM categorias;');
  if (conteoCategorias[0]?.total === 0) {
    for (const cat of categoriasIniciales) {
      await db.execute(
        'INSERT INTO categorias (id, nombre, color, descripcion) VALUES ($1, $2, $3, $4);',
        [cat.id, cat.nombre, cat.color || 'blue', cat.descripcion || '']
      );
    }
  }

  // Sembrar Productos
  const conteoProductos = await db.select('SELECT COUNT(*) as total FROM productos;');
  if (conteoProductos[0]?.total === 0) {
    for (const prod of productosIniciales) {
      await db.execute(
        'INSERT INTO productos (id, codigo, nombre, categoria, precio, costo, stock, unidad, imagen, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
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
  }

  // Sembrar Clientes
  const conteoClientes = await db.select('SELECT COUNT(*) as total FROM clientes;');
  if (conteoClientes[0]?.total === 0) {
    for (const cli of clientesIniciales) {
      await db.execute(
        'INSERT INTO clientes (id, nombre, telefono, es_predeterminado) VALUES ($1, $2, $3, $4);',
        [cli.id, cli.nombre, cli.telefono || 'Sin teléfono', cli.esPredeterminado ? 1 : 0]
      );
    }
  }

  // Sembrar Configuración
  const conteoConfig = await db.select('SELECT COUNT(*) as total FROM configuracion;');
  if (conteoConfig[0]?.total === 0) {
    for (const [clave, valor] of Object.entries(configuracionInicial)) {
      await db.execute(
        'INSERT INTO configuracion (clave, valor) VALUES ($1, $2);',
        [clave, typeof valor === 'object' ? JSON.stringify(valor) : String(valor)]
      );
    }
  }

  // Sembrar Turno y Movimientos de Caja iniciales
  const conteoTurnos = await db.select('SELECT COUNT(*) as total FROM turnos_caja;');
  if (conteoTurnos[0]?.total === 0 && datosCajaInicial.turnoActual) {
    const turno = datosCajaInicial.turnoActual;
    await db.execute(
      'INSERT INTO turnos_caja (id, cajero, fecha_apertura, fondo_inicial, estado) VALUES ($1, $2, $3, $4, $5);',
      [
        turno.id,
        turno.cajero,
        turno.fechaApertura || new Date().toISOString(),
        turno.fondoInicial || 500,
        datosCajaInicial.cajaAbierta ? 'abierto' : 'cerrado',
      ]
    );

    if (turno.movimientos && turno.movimientos.length > 0) {
      for (const mov of turno.movimientos) {
        await db.execute(
          'INSERT INTO movimientos_caja (id, turno_id, tipo, monto, concepto, fecha) VALUES ($1, $2, $3, $4, $5, $6);',
          [mov.id, turno.id, mov.tipo, mov.monto, mov.concepto, mov.fecha]
        );
      }
    }
  }

  // Sembrar Ventas Iniciales
  const conteoVentas = await db.select('SELECT COUNT(*) as total FROM ventas;');
  if (conteoVentas[0]?.total === 0 && ventasIniciales && ventasIniciales.length > 0) {
    for (const v of ventasIniciales) {
      await db.execute(
        `INSERT INTO ventas (
          id, fecha, cliente_id, cliente_nombre, cliente_telefono,
          subtotal, descuento, subtotal_neto, impuestos, total, total_articulos,
          metodo_pago, monto_recibido, cambio, referencia, comprobante
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
        [
          v.id,
          v.fecha,
          v.cliente?.id || null,
          v.cliente?.nombre || 'Público General',
          v.cliente?.telefono || '',
          v.totales?.subtotal || 0,
          v.totales?.descuento || 0,
          v.totales?.subtotalNeto || 0,
          v.totales?.impuestos || 0,
          v.totales?.total || 0,
          v.totales?.totalArticulos || 0,
          v.pago?.metodo || 'efectivo',
          v.pago?.montoRecibido || 0,
          v.pago?.cambio || 0,
          v.pago?.referencia || '',
          v.pago?.comprobante || null,
        ]
      );

      if (v.articulos && v.articulos.length > 0) {
        for (const art of v.articulos) {
          await db.execute(
            `INSERT INTO venta_articulos (
              venta_id, producto_id, codigo, nombre, precio, cantidad, descuento, unidad, subtotal
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
            [
              v.id,
              art.id,
              art.codigo || '',
              art.nombre,
              art.precio,
              art.cantidad,
              art.descuento || 0,
              art.unidad || 'Pza',
              art.subtotal,
            ]
          );
        }
      }
    }
  }
};

// Respaldo para entorno Web / Vercel
const inicializarRespaldoWeb = () => {
  if (!localStorage.getItem('pos_categorias')) {
    localStorage.setItem('pos_categorias', JSON.stringify(categoriasIniciales));
  }
  if (!localStorage.getItem('pos_productos')) {
    localStorage.setItem('pos_productos', JSON.stringify(productosIniciales));
  }
  if (!localStorage.getItem('pos_clientes')) {
    localStorage.setItem('pos_clientes', JSON.stringify(clientesIniciales));
  }
  if (!localStorage.getItem('pos_configuracion')) {
    localStorage.setItem('pos_configuracion', JSON.stringify(configuracionInicial));
  }
  if (!localStorage.getItem('pos_caja_abierta')) {
    localStorage.setItem('pos_caja_abierta', JSON.stringify(datosCajaInicial.cajaAbierta));
  }
  if (!localStorage.getItem('pos_turno_actual')) {
    localStorage.setItem('pos_turno_actual', JSON.stringify(datosCajaInicial.turnoActual));
  }
  if (!localStorage.getItem('pos_historial_ventas')) {
    localStorage.setItem('pos_historial_ventas', JSON.stringify(ventasIniciales));
  }
};

// Ejecutar consulta SELECT
export const ejecutarConsulta = async (consultaSql, parametros = []) => {
  const db = await inicializarBaseDatos();
  if (db) {
    return await db.select(consultaSql, parametros);
  }
  return null;
};

// Ejecutar comando INSERT, UPDATE, DELETE
export const ejecutarComando = async (comandoSql, parametros = []) => {
  const db = await inicializarBaseDatos();
  if (db) {
    return await db.execute(comandoSql, parametros);
  }
  return null;
};
