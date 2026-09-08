// Servicio para gestion y persistencia de ventas y tickets en SQLite
import ventasIniciales from '../data/ventas.json';
import {
  inicializarBaseDatos,
  ejecutarConsulta,
  ejecutarComando,
  esEntornoTauri,
} from './baseDatosServicio';
import { descontarStockBD } from './productoServicio';

let cacheVentas = null;

// Obtener ventas sincronas (desde cache o localStorage)
export const obtenerVentas = () => {
  if (cacheVentas && cacheVentas.length > 0) {
    return cacheVentas;
  }

  const guardadas = localStorage.getItem('pos_historial_ventas');
  if (guardadas) {
    try {
      cacheVentas = JSON.parse(guardadas);
      return cacheVentas;
    } catch {
      cacheVentas = ventasIniciales;
      return ventasIniciales;
    }
  }

  cacheVentas = ventasIniciales;
  return ventasIniciales;
};

// Cargar ventas completas desde SQLite con sus articulos asociados
export const cargarVentasBD = async () => {
  try {
    await inicializarBaseDatos();
    if (esEntornoTauri()) {
      const ventasSql = await ejecutarConsulta(
        `SELECT id, fecha, cliente_id, cliente_nombre, cliente_telefono,
                subtotal, descuento, subtotal_neto, impuestos, total, total_articulos,
                metodo_pago, monto_recibido, cambio, referencia, comprobante
         FROM ventas
         ORDER BY fecha DESC;`
      );

      if (ventasSql && ventasSql.length > 0) {
        const articulosSql = await ejecutarConsulta(
          `SELECT id, venta_id, producto_id, codigo, nombre, precio, cantidad, descuento, unidad, subtotal
           FROM venta_articulos;`
        );

        // Agrupar articulos por venta_id
        const articulosPorVenta = {};
        (articulosSql || []).forEach((art) => {
          if (!articulosPorVenta[art.venta_id]) {
            articulosPorVenta[art.venta_id] = [];
          }
          articulosPorVenta[art.venta_id].push({
            id: art.producto_id || art.id,
            codigo: art.codigo,
            nombre: art.nombre,
            precio: art.precio,
            cantidad: art.cantidad,
            descuento: art.descuento,
            unidad: art.unidad,
            subtotal: art.subtotal,
          });
        });

        // Reconstruir estructura completa de cada venta
        const ventasCompletas = ventasSql.map((v) => ({
          id: v.id,
          fecha: v.fecha,
          cliente: {
            id: v.cliente_id,
            nombre: v.cliente_nombre,
            telefono: v.cliente_telefono,
          },
          articulos: articulosPorVenta[v.id] || [],
          totales: {
            subtotal: v.subtotal,
            descuento: v.descuento,
            subtotalNeto: v.subtotal_neto,
            impuestos: v.impuestos,
            total: v.total,
            totalArticulos: v.total_articulos,
          },
          pago: {
            metodo: v.metodo_pago,
            montoRecibido: v.monto_recibido,
            cambio: v.cambio,
            referencia: v.referencia || '',
            comprobante: v.comprobante || null,
          },
        }));

        cacheVentas = ventasCompletas;
        localStorage.setItem('pos_historial_ventas', JSON.stringify(ventasCompletas));
        return ventasCompletas;
      }
    }
  } catch (error) {
    console.warn('Error al cargar ventas desde SQLite:', error);
  }

  return obtenerVentas();
};

// Registrar una nueva venta en SQLite y descontar existencias
export const registrarVentaBD = async (nuevaVenta) => {
  const listaActual = obtenerVentas();
  const nuevaLista = [nuevaVenta, ...listaActual];

  cacheVentas = nuevaLista;
  localStorage.setItem('pos_historial_ventas', JSON.stringify(nuevaLista));

  // Descontar existencias de productos
  await descontarStockBD(nuevaVenta.articulos);

  if (esEntornoTauri()) {
    try {
      // 1. Insertar encabezado de la venta
      await ejecutarComando(
        `INSERT INTO ventas (
          id, fecha, cliente_id, cliente_nombre, cliente_telefono,
          subtotal, descuento, subtotal_neto, impuestos, total, total_articulos,
          metodo_pago, monto_recibido, cambio, referencia, comprobante
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
        [
          nuevaVenta.id,
          nuevaVenta.fecha,
          nuevaVenta.cliente?.id || null,
          nuevaVenta.cliente?.nombre || 'Público General',
          nuevaVenta.cliente?.telefono || '',
          nuevaVenta.totales.subtotal,
          nuevaVenta.totales.descuento || 0,
          nuevaVenta.totales.subtotalNeto,
          nuevaVenta.totales.impuestos,
          nuevaVenta.totales.total,
          nuevaVenta.totales.totalArticulos,
          nuevaVenta.pago.metodo,
          nuevaVenta.pago.montoRecibido,
          nuevaVenta.pago.cambio || 0,
          nuevaVenta.pago.referencia || '',
          nuevaVenta.pago.comprobante || null,
        ]
      );

      // 2. Insertar cada articulo vendido
      for (const art of nuevaVenta.articulos) {
        await ejecutarComando(
          `INSERT INTO venta_articulos (
            venta_id, producto_id, codigo, nombre, precio, cantidad, descuento, unidad, subtotal
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [
            nuevaVenta.id,
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
    } catch (error) {
      console.error('Error al guardar venta en SQLite:', error);
    }
  }

  return nuevaVenta;
};
