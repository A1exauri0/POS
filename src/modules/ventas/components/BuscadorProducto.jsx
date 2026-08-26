import { useState, useRef, useEffect } from 'react';
import { TextInput, ActionIcon, Badge } from '@mantine/core';
import { IconBarcode, IconSearch, IconX } from '@tabler/icons-react';
import { CATEGORIAS_PRODUCTOS, buscarProductoPorCodigoONombre } from '../../../services/productoServicio';
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
    <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
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
          radius="md"
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

      {/* Filtros de Categorias Rapidas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIAS_PRODUCTOS.map((categoria) => {
          const seleccionada = categoriaSeleccionada === categoria;
          return (
            <button
              key={categoria}
              type="button"
              onClick={() => setCategoriaSeleccionada(categoria)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                seleccionada
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {categoria}
            </button>
          );
        })}
      </div>
    </div>
  );
};
