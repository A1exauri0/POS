import { useState, useRef, useEffect } from 'react';
import { TextInput, ActionIcon, Badge } from '@mantine/core';
import {
  IconBarcode,
  IconSearch,
  IconX,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { obtenerCategorias, buscarProductoPorCodigoONombre } from '../../../services/productoServicio';
import { useVenta } from '../../../contexts/VentaContext';

export const BuscadorProducto = ({
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  terminoBusqueda,
  setTerminoBusqueda,
  inputRef,
}) => {
  const { agregarProducto } = useVenta();
  const [mensajeError, setMensajeError] = useState('');
  const [categorias, setCategorias] = useState(() => obtenerCategorias());
  const contenedorCategoriasRef = useRef(null);

  // Recargar categorias al montar y mantener sincronia
  useEffect(() => {
    setCategorias(obtenerCategorias());
  }, []);

  // Desplazar contenedor de categorias con flechas
  const desplazarCategorias = (direccion) => {
    if (contenedorCategoriasRef.current) {
      const cantidad = direccion === 'izquierda' ? -180 : 180;
      contenedorCategoriasRef.current.scrollBy({ left: cantidad, behavior: 'smooth' });
    }
  };

  // Manejar busqueda o escaneo directo por Enter
  const manejarKeyDown = (e) => {
    if (e.key === 'Enter' && terminoBusqueda.trim()) {
      e.preventDefault();
      const resultado = buscarProductoPorCodigoONombre(terminoBusqueda);

      if (resultado && !Array.isArray(resultado)) {
        // Coincidencia exacta de codigo de barras
        agregarProducto(resultado, 1);
        setTerminoBusqueda('');
        setMensajeError('');
      } else if (Array.isArray(resultado) && resultado.length === 1) {
        // Unica coincidencia en catalogo
        agregarProducto(resultado[0], 1);
        setTerminoBusqueda('');
        setMensajeError('');
      } else if (Array.isArray(resultado) && resultado.length === 0) {
        setMensajeError('Producto no encontrado');
        setTimeout(() => setMensajeError(''), 2500);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Input de Busqueda / Lector de Barras */}
      <div className="relative">
        <TextInput
          ref={inputRef}
          value={terminoBusqueda}
          onChange={(e) => {
            setTerminoBusqueda(e.target.value);
            if (mensajeError) setMensajeError('');
          }}
          onKeyDown={manejarKeyDown}
          placeholder="Escanear código de barras o buscar por nombre... (Presiona Enter o F4)"
          size="md"
          radius="xl"
          leftSection={<IconBarcode size={22} className="text-slate-400" />}
          rightSection={
            terminoBusqueda ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => {
                  setTerminoBusqueda('');
                  inputRef.current?.focus();
                }}
              >
                <IconX size={16} />
              </ActionIcon>
            ) : (
              <kbd className="hidden sm:inline-block bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded border border-slate-300 font-mono">
                F4
              </kbd>
            )
          }
          classNames={{
            input:
              'font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 border-slate-300 shadow-inner text-base',
          }}
          error={mensajeError}
        />
      </div>

      {/* Filtros de Categorias Rapidas con flechas de desplazamiento */}
      <div className="flex items-center gap-1.5 w-full">
        {/* Flecha Izquierda */}
        <ActionIcon
          variant="light"
          color="gray"
          size="md"
          radius="md"
          onClick={() => desplazarCategorias('izquierda')}
          className="shrink-0 hover:bg-slate-200 text-slate-600 cursor-pointer"
          aria-label="Desplazar categorías hacia la izquierda"
        >
          <IconChevronLeft size={18} />
        </ActionIcon>

        {/* Contenedor desplazable de categorias */}
        <div
          ref={contenedorCategoriasRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
        >
          {/* Opcion Todos */}
          <Badge
            component="button"
            type="button"
            size="lg"
            variant={categoriaSeleccionada === 'Todos' ? 'filled' : 'light'}
            color="dark"
            radius="md"
            className="cursor-pointer transition-all duration-150 select-none hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0.5 active:scale-90 shrink-0 uppercase tracking-wider text-[11px] py-1 px-3.5 border-0 focus:outline-none"
            onClick={() => setCategoriaSeleccionada('Todos')}
          >
            Todos
          </Badge>

          {/* Categorias del sistema con su color asignado */}
          {categorias.map((cat) => {
            const seleccionada = categoriaSeleccionada === cat.nombre;
            return (
              <Badge
                key={cat.id || cat.nombre}
                component="button"
                type="button"
                size="lg"
                variant={seleccionada ? 'filled' : 'light'}
                color={cat.color || 'blue'}
                radius="md"
                className="cursor-pointer transition-all duration-150 select-none hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0.5 active:scale-90 shrink-0 text-xs py-1 px-3.5 border-0 focus:outline-none font-semibold"
                onClick={() => setCategoriaSeleccionada(cat.nombre)}
              >
                {cat.nombre}
              </Badge>
            );
          })}
        </div>

        {/* Flecha Derecha */}
        <ActionIcon
          variant="light"
          color="gray"
          size="md"
          radius="md"
          onClick={() => desplazarCategorias('derecha')}
          className="shrink-0 hover:bg-slate-200 text-slate-600 cursor-pointer"
          aria-label="Desplazar categorías hacia la derecha"
        >
          <IconChevronRight size={18} />
        </ActionIcon>
      </div>
    </div>
  );
};
