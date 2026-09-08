import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import {
  obtenerProductos,
  cargarProductosBD,
} from '../services/productoServicio';
import {
  obtenerClientePredeterminado,
  cargarClientesBD,
} from '../services/clienteServicio';
import {
  obtenerVentas,
  cargarVentasBD,
  registrarVentaBD,
} from '../services/ventaServicio';

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

  // Historial de ventas completadas
  const [historialVentas, setHistorialVentas] = useState(() => obtenerVentas());

  // Cargar datos iniciales desde SQLite al montar
  useEffect(() => {
    const hidratarDatos = async () => {
      const ventasBD = await cargarVentasBD();
      if (ventasBD) setHistorialVentas(ventasBD);

      await cargarProductosBD();
      const clientesBD = await cargarClientesBD();
      if (clientesBD) {
        const predeterminado = clientesBD.find((c) => c.esPredeterminado) || clientesBD[0];
        if (predeterminado) setCliente(predeterminado);
      }
    };

    hidratarDatos();
  }, []);

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

  // Completar y registrar la venta en SQLite
  const completarVenta = async (datosPago) => {
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

    // Registrar en SQLite y actualizar existencias
    await registrarVentaBD(nuevaVenta);

    // Actualizar estado local de ventas
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
