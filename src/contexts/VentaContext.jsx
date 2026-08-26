import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { obtenerProductos, guardarProductos } from '../services/productoServicio';
import ventasIniciales from '../data/ventas.json';

const VentaContext = createContext(null);

export const VentaProvider = ({ children }) => {
  // Lista de articulos en el ticket/carrito actual
  const [articulos, setArticulos] = useState([]);

  // Datos del cliente actual
  const [cliente, setCliente] = useState({
    id: 'gral',
    nombre: 'Público General',
    rfc: 'XAXX010101000',
    telefono: 'Sin teléfono',
  });

  // Modal de cobro activo
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);

  // Historial de ventas completadas
  const [historialVentas, setHistorialVentas] = useState(() => {
    const ventasGuardadas = localStorage.getItem('pos_historial_ventas');
    if (!ventasGuardadas) {
      localStorage.setItem('pos_historial_ventas', JSON.stringify(ventasIniciales));
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
            subtotal: nuevaCantidad * item.precio * (1 - (item.descuento || 0) / 100),
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

  // Aplicar porcentaje de descuento a un item
  const aplicarDescuento = (id, porcentaje) => {
    setArticulos((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const desc = Math.min(Math.max(porcentaje, 0), 100);
          return {
            ...item,
            descuento: desc,
            subtotal: item.cantidad * item.precio * (1 - desc / 100),
          };
        }
        return item;
      })
    );
  };

  // Limpiar toda la venta actual
  const limpiarVenta = () => {
    setArticulos([]);
  };

  // Calculo de totales
  const totales = useMemo(() => {
    let subtotalSinDescuento = 0;
    let totalDescuento = 0;
    let totalGeneral = 0;
    let totalArticulos = 0;

    articulos.forEach((item) => {
      const precioBruto = item.precio * item.cantidad;
      const montoDescuento = precioBruto * ((item.descuento || 0) / 100);
      subtotalSinDescuento += precioBruto;
      totalDescuento += montoDescuento;
      totalGeneral += precioBruto - montoDescuento;
      totalArticulos += item.cantidad;
    });

    // Desglose de IVA (16% en Mexico)
    const subtotalNeto = totalGeneral / 1.16;
    const impuestoIva = totalGeneral - subtotalNeto;

    return {
      subtotal: subtotalSinDescuento,
      descuento: totalDescuento,
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

    // Limpiar carrito y cerrar modal
    limpiarVenta();
    setModalCobroAbierto(false);

    notifications.show({
      title: '¡Venta Realizada con Éxito!',
      message: `Folio: ${folioVenta} - Total: $${totales.total.toFixed(2)}`,
      color: 'green',
      icon: <IconCheck size={18} />,
      autoClose: 3500,
    });

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
        agregarProducto,
        cambiarCantidad,
        eliminarArticulo,
        aplicarDescuento,
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
