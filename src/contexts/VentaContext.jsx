import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { obtenerProductos, guardarProductos } from '../services/productoServicio';
import { obtenerClientePredeterminado } from '../services/clienteServicio';
import ventasIniciales from '../data/ventas.json';

const VentaContext = createContext(null);

export const VentaProvider = ({ children }) => {
  // Lista de articulos en el ticket/carrito actual
  const [articulos, setArticulos] = useState([]);

  // Datos del cliente actual (Siempre Publico General por defecto)
  const [cliente, setCliente] = useState(() => obtenerClientePredeterminado());

  // Modal de cobro activo y modal de venta exitosa
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [ultimaVentaRealizada, setUltimaVentaRealizada] = useState(null);

  // Historial de ventas completadas con sincronizacion automatica desde ventas.json
  const [historialVentas, setHistorialVentas] = useState(() => {
    const ventasGuardadas = localStorage.getItem('pos_historial_ventas');
    const huellaGuardada = localStorage.getItem('pos_historial_ventas_huella');
    const huellaActual = JSON.stringify(ventasIniciales);

    if (!ventasGuardadas || huellaGuardada !== huellaActual) {
      localStorage.setItem('pos_historial_ventas', JSON.stringify(ventasIniciales));
      localStorage.setItem('pos_historial_ventas_huella', huellaActual);
      return ventasIniciales;
    }

    try {
      return JSON.parse(ventasGuardadas);
    } catch {
      return ventasIniciales;
    }
  });

  // Guardar historial en local storage
  useEffect(() => {
    localStorage.setItem('pos_historial_ventas', JSON.stringify(historialVentas));
  }, [historialVentas]);

  // Agregar un producto al carrito
  const agregarProducto = (producto, cantidad = 1) => {
    if (!producto) return;

    setArticulos((articulosPrevios) => {
      const existeIndice = articulosPrevios.findIndex((item) => item.id === producto.id);

      if (existeIndice > -1) {
        const itemActual = articulosPrevios[existeIndice];
        const nuevaCantidad = itemActual.cantidad + cantidad;

        // Validar stock disponible
        if (producto.stock && nuevaCantidad > producto.stock) {
          notifications.show({
            title: 'Stock insuficiente',
            message: `Solo hay ${producto.stock} unidades de ${producto.nombre}`,
            color: 'orange',
            icon: <IconAlertCircle size={18} />,
          });
        }

        const actualizados = [...articulosPrevios];
        actualizados[existeIndice] = {
          ...itemActual,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * itemActual.precio,
        };
        return actualizados;
      }

      // Nuevo producto en la venta
      return [
        ...articulosPrevios,
        {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidad,
          descuento: 0,
          unidad: producto.unidad || 'Pza',
          subtotal: producto.precio * cantidad,
          stockMaximo: producto.stock,
        },
      ];
    });
  };

  // Actualizar cantidad de un articulo
  const cambiarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarArticulo(id);
      return;
    }

    setArticulos((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * item.precio,
          };
        }
        return item;
      })
    );
  };

  // Eliminar un articulo del ticket
  const eliminarArticulo = (id) => {
    setArticulos((prev) => prev.filter((item) => item.id !== id));
  };

  // Limpiar toda la venta actual y restablecer cliente a Publico General
  const limpiarVenta = () => {
    setArticulos([]);
    setCliente(obtenerClientePredeterminado());
  };

  // Calculo de totales
  const totales = useMemo(() => {
    let totalGeneral = 0;
    let totalArticulos = 0;

    articulos.forEach((item) => {
      totalGeneral += item.precio * item.cantidad;
      totalArticulos += item.cantidad;
    });

    // Desglose de IVA (16% en Mexico)
    const subtotalNeto = totalGeneral / 1.16;
    const impuestoIva = totalGeneral - subtotalNeto;

    return {
      subtotal: totalGeneral,
      descuento: 0,
      subtotalNeto,
      impuestos: impuestoIva,
      total: totalGeneral,
      totalArticulos,
    };
  }, [articulos]);

  // Completar y registrar la venta
  const completarVenta = (datosPago) => {
    if (articulos.length === 0) return null;

    const folioVenta = `TKT-${Date.now().toString().slice(-6)}`;
    const fechaActual = new Date().toISOString();

    const nuevaVenta = {
      id: folioVenta,
      fecha: fechaActual,
      cliente,
      articulos: [...articulos],
      totales,
      pago: {
        metodo: datosPago.metodo, // 'efectivo', 'tarjeta', 'transferencia'
        montoRecibido: datosPago.montoRecibido || totales.total,
        cambio: datosPago.cambio || 0,
        referencia: datosPago.referencia || '',
      },
    };

    // Actualizar stock de los productos
    const productosActuales = obtenerProductos();
    const productosActualizados = productosActuales.map((p) => {
      const vendido = articulos.find((art) => art.id === p.id);
      if (vendido) {
        return {
          ...p,
          stock: Math.max(0, p.stock - vendido.cantidad),
        };
      }
      return p;
    });
    guardarProductos(productosActualizados);

    // Guardar en el historial
    setHistorialVentas((prev) => [nuevaVenta, ...prev]);

    // Limpiar carrito, cerrar modal de cobro y abrir modal de exito
    limpiarVenta();
    setModalCobroAbierto(false);
    setUltimaVentaRealizada(nuevaVenta);
    setModalExitoAbierto(true);

    return nuevaVenta;
  };

  return (
    <VentaContext.Provider
      value={{
        articulos,
        cliente,
        setCliente,
        totales,
        modalCobroAbierto,
        setModalCobroAbierto,
        modalExitoAbierto,
        setModalExitoAbierto,
        ultimaVentaRealizada,
        agregarProducto,
        cambiarCantidad,
        eliminarArticulo,
        limpiarVenta,
        completarVenta,
        historialVentas,
      }}
    >
      {children}
    </VentaContext.Provider>
  );
};

export const useVenta = () => {
  const contexto = useContext(VentaContext);
  if (!contexto) {
    throw new Error('useVenta debe usarse dentro de un VentaProvider');
  }
  return contexto;
};
