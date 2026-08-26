import { useState, useRef, useEffect, useMemo } from 'react';
import { BuscadorProducto } from './components/BuscadorProducto';
import { CatalogoProductos } from './components/CatalogoProductos';
import { PanelTicket } from './components/PanelTicket';
import { ModalCobro } from './components/ModalCobro';
import { ModalVentaExitosa } from './components/ModalVentaExitosa';
import { ModalConfirmacion } from '../../components/ModalConfirmacion';
import { IconTrash } from '@tabler/icons-react';
import { obtenerProductos } from '../../services/productoServicio';
import { useVenta } from '../../contexts/VentaContext';

export const PantallaVentas = () => {
  const {
    articulos,
    setModalCobroAbierto,
    modalCobroAbierto,
    modalExitoAbierto,
    limpiarVenta,
  } = useVenta();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalLimpiarAbierto, setModalLimpiarAbierto] = useState(false);
  const inputBuscadorRef = useRef(null);

  // Lista de productos actualizada
  const [catalogo, setCatalogo] = useState(() => obtenerProductos());

  // Refrescar catalogo al cambiar estado de ventas
  useEffect(() => {
    setCatalogo(obtenerProductos());
  }, [articulos]);

  // Filtrado reactivo de productos en base a categoria y texto
  const productosFiltrados = useMemo(() => {
    return catalogo.filter((producto) => {
      const coincideCategoria =
        categoriaSeleccionada === 'Todos' || producto.categoria === categoriaSeleccionada;
      const coincideTermino =
        !terminoBusqueda.trim() ||
        producto.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(terminoBusqueda.trim().toLowerCase()) ||
        producto.categoria.toLowerCase().includes(terminoBusqueda.trim().toLowerCase());

      return coincideCategoria && coincideTermino;
    });
  }, [catalogo, categoriaSeleccionada, terminoBusqueda]);

  // Atajos de Teclado Globales (F2: Cobrar, F4: Enfocar Buscador, F9: Limpiar Venta)
  useEffect(() => {
    const manejarTeclas = (e) => {
      // F2: Abrir modal de cobro si hay articulos
      if (e.key === 'F2') {
        e.preventDefault();
        if (articulos.length > 0) {
          setModalCobroAbierto(true);
        }
      }
      // F4: Enfocar input de busqueda/codigo de barras
      else if (e.key === 'F4') {
        e.preventDefault();
        inputBuscadorRef.current?.focus();
        inputBuscadorRef.current?.select();
      }
      // F9: Limpiar venta actual
      else if (e.key === 'F9') {
        e.preventDefault();
        if (articulos.length > 0) {
          setModalLimpiarAbierto(true);
        }
      }
      // ESC: Cerrar modal si esta abierto o limpiar buscador
      else if (e.key === 'Escape') {
        if (!modalCobroAbierto && terminoBusqueda) {
          setTerminoBusqueda('');
        }
      }
    };

    window.addEventListener('keydown', manejarTeclas);
    return () => window.removeEventListener('keydown', manejarTeclas);
  }, [articulos.length, modalCobroAbierto, terminoBusqueda, setModalCobroAbierto, limpiarVenta]);

  // Enfocar buscador al cerrar modales para iniciar siguiente venta
  useEffect(() => {
    if (!modalCobroAbierto && !modalExitoAbierto) {
      setTimeout(() => {
        inputBuscadorRef.current?.focus();
      }, 50);
    }
  }, [modalCobroAbierto, modalExitoAbierto]);

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-100">
      {/* Seccion Izquierda: Buscador + Catalogo de Productos */}
      <main className="flex-1 flex flex-col p-3.5 gap-3 overflow-hidden">
        {/* Buscador y Categorias */}
        <BuscadorProducto
          inputRef={inputBuscadorRef}
          categoriaSeleccionada={categoriaSeleccionada}
          setCategoriaSeleccionada={setCategoriaSeleccionada}
          terminoBusqueda={terminoBusqueda}
          setTerminoBusqueda={setTerminoBusqueda}
        />

        {/* Catalogo en Rejilla */}
        <CatalogoProductos productos={productosFiltrados} />
      </main>

      {/* Seccion Derecha: Panel del Ticket de Venta */}
      <PanelTicket />

      {/* Modal de Pago / Liquidacion */}
      <ModalCobro />

      {/* Modal de Venta Exitosa con Resumen y Cambio */}
      <ModalVentaExitosa />

      {/* Modal de confirmacion para vaciar ticket */}
      <ModalConfirmacion
        abierto={modalLimpiarAbierto}
        alCerrar={() => setModalLimpiarAbierto(false)}
        alConfirmar={limpiarVenta}
        titulo="¿Vaciar ticket actual?"
        mensaje="Se removerán todos los artículos agregados al ticket de venta actual."
        textoConfirmar="Vaciar Ticket"
        color="red"
        icono={IconTrash}
      />
    </div>
  );
};
