import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Button,
  TextInput,
  Badge,
  Modal,
  NumberInput,
  Select,
  Group,
  ActionIcon,
  Tooltip,
  Tabs,
  Pagination,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconPackage,
  IconBarcode,
  IconCategory,
  IconPhoto,
  IconUpload,
} from '@tabler/icons-react';
import {
  obtenerProductos,
  cargarProductosBD,
  guardarProductoBD,
  eliminarProductoBD,
  obtenerCategorias,
  cargarCategoriasBD,
} from '../../services/productoServicio';
import { formatearMoneda } from '../../utils/formateadores';
import { GestionCategorias } from './components/GestionCategorias';
import { ModalConfirmacion } from '../../components/ModalConfirmacion';

export const PantallaInventario = () => {
  const [pestanaActiva, setPestanaActiva] = useState('productos');
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [categorias, setCategorias] = useState(() => obtenerCategorias());
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // Cargar datos frescos desde SQLite al montar la vista
  useEffect(() => {
    cargarProductosBD().then(setProductos);
    cargarCategoriasBD().then(setCategorias);
  }, []);

  // Formulario temporal de producto
  const [formCodigo, setFormCodigo] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formPrecio, setFormPrecio] = useState(0);
  const [formCosto, setFormCosto] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formImagen, setFormImagen] = useState('');

  const abrirModalNuevo = () => {
    setProductoEnEdicion(null);
    setFormCodigo(`750${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormNombre('');
    setFormCategoria(categorias[0]?.nombre || 'General');
    setFormPrecio(0);
    setFormCosto(0);
    setFormStock(10);
    setFormImagen('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (prod) => {
    setProductoEnEdicion(prod);
    setFormCodigo(prod.codigo);
    setFormNombre(prod.nombre);
    setFormCategoria(prod.categoria);
    setFormPrecio(prod.precio);
    setFormCosto(prod.costo || 0);
    setFormStock(prod.stock);
    setFormImagen(prod.imagen || '');
    setModalAbierto(true);
  };

  const guardarProducto = async () => {
    if (!formNombre.trim() || !formCodigo.trim()) return;

    let productoAGuardar;
    if (productoEnEdicion) {
      productoAGuardar = {
        ...productoEnEdicion,
        codigo: formCodigo,
        nombre: formNombre,
        categoria: formCategoria || 'General',
        precio: formPrecio,
        costo: formCosto,
        stock: formStock,
        imagen: formImagen.trim(),
      };
    } else {
      productoAGuardar = {
        id: `prod-${Date.now()}`,
        codigo: formCodigo,
        nombre: formNombre,
        categoria: formCategoria || 'General',
        precio: formPrecio,
        costo: formCosto,
        stock: formStock,
        unidad: 'Pza',
        imagen: formImagen.trim(),
      };
    }

    const listaActualizada = await guardarProductoBD(productoAGuardar);
    setProductos(listaActualizada);
    setModalAbierto(false);
  };

  const confirmarEliminarProducto = async () => {
    if (!productoAEliminar) return;
    const listaActualizada = await eliminarProductoBD(productoAEliminar.id);
    setProductos(listaActualizada);
    setProductoAEliminar(null);
  };

  const manejarActualizacionCategorias = (nuevasCategorias) => {
    setCategorias(nuevasCategorias);
    setProductos(obtenerProductos()); // Refrescar productos en caso de reasignaciones
  };

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 8;

  const filtrados = useMemo(() => {
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        p.codigo.includes(terminoBusqueda) ||
        p.categoria.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );
  }, [productos, terminoBusqueda]);

  // Reiniciar a la primera pagina al buscar
  useEffect(() => {
    setPaginaActual(1);
  }, [terminoBusqueda]);

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina) || 1;
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return filtrados.slice(inicio, inicio + itemsPorPagina);
  }, [filtrados, paginaActual, itemsPorPagina]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-hidden">
      {/* Pestañas de navegacion entre Productos y Categorias */}
      <div className="bg-white px-4 pt-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <Tabs value={pestanaActiva} onChange={setPestanaActiva} color="indigo">
          <Tabs.List>
            <Tabs.Tab value="productos" leftSection={<IconPackage size={18} />}>
              <span className="font-bold">Catálogo de Productos</span>
            </Tabs.Tab>
            <Tabs.Tab value="categorias" leftSection={<IconCategory size={18} />}>
              <span className="font-bold">Categorías</span>
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>

      {pestanaActiva === 'productos' ? (
        <>
          {/* Barra de Herramientas de Productos */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3.5">
              <TextInput
                placeholder="Buscar por código, nombre o categoría..."
                leftSection={<IconSearch size={16} className="text-slate-400" />}
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                size="sm"
                radius="xl"
                className="w-80"
              />
              <span className="text-xs text-slate-500 font-medium">
                {productos.length} productos registrados
              </span>
            </div>

            <Button
              color="teal"
              radius="xl"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={abrirModalNuevo}
              className="font-bold shadow-md shadow-teal-500/15"
            >
              Nuevo Producto
            </Button>
          </div>

          {/* Tabla de Productos con Columna de Imagen y Paginacion */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Table highlightOnHover verticalSpacing="md" stickyHeader className="w-full">
                <Table.Thead className="bg-slate-50/80 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
                  <Table.Tr>
                    <Table.Th className="w-24">Imagen</Table.Th>
                    <Table.Th className="w-36">Código</Table.Th>
                    <Table.Th className="min-w-[200px]">Nombre del Producto</Table.Th>
                    <Table.Th className="w-36">Categoría</Table.Th>
                    <Table.Th className="w-28">Costo</Table.Th>
                    <Table.Th className="w-32">Precio Venta</Table.Th>
                    <Table.Th className="w-32">Stock Actual</Table.Th>
                    <Table.Th className="w-24 text-right">Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtrados.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                        No se encontraron productos.
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    productosPaginados.map((prod) => {
                      const sinStock = prod.stock <= 0;
                      const stockBajo = prod.stock > 0 && prod.stock <= 10;
                      const catObj = categorias.find((c) => c.nombre === prod.categoria);
                      const tieneImg = Boolean(prod.imagen && prod.imagen.trim());

                      return (
                        <Table.Tr key={prod.id} className="text-sm text-slate-800 hover:bg-slate-50/80 transition-colors">
                          {/* Miniatura de Imagen Ampliada o Icono Placeholder */}
                          <Table.Td>
                            <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {tieneImg ? (
                                <img
                                  src={prod.imagen}
                                  alt={prod.nombre}
                                  className="w-full h-full object-cover transition-transform duration-150 hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-img');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div
                                className={`fallback-img w-full h-full flex items-center justify-center text-slate-300 bg-slate-100/60 ${
                                  tieneImg ? 'hidden' : 'flex'
                                }`}
                              >
                                <IconPhoto size={20} stroke={1.5} />
                              </div>
                            </div>
                          </Table.Td>

                          <Table.Td className="font-mono text-xs font-semibold text-slate-600">
                            {prod.codigo}
                          </Table.Td>
                          <Table.Td className="font-semibold text-slate-900">{prod.nombre}</Table.Td>
                          <Table.Td>
                            <Badge variant="light" color={catObj?.color || 'indigo'} size="sm">
                              {prod.categoria}
                            </Badge>
                          </Table.Td>
                          <Table.Td className="font-mono text-slate-500">
                            {formatearMoneda(prod.costo || 0)}
                          </Table.Td>
                          <Table.Td className="font-mono font-bold text-emerald-700">
                            {formatearMoneda(prod.precio)}
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              variant="filled"
                              size="sm"
                              color={sinStock ? 'red' : stockBajo ? 'orange' : 'teal'}
                            >
                              {prod.stock} {prod.unidad || 'Pza'}
                            </Badge>
                          </Table.Td>
                          <Table.Td className="text-right">
                            <Group gap="xs" justify="flex-end">
                              <Tooltip label="Editar">
                                <ActionIcon
                                  variant="subtle"
                                  color="indigo"
                                  onClick={() => abrirModalEditar(prod)}
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Eliminar">
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => setProductoAEliminar(prod)}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  )}
                </Table.Tbody>
              </Table>
            </div>

            {/* Pie de Paginación */}
            {filtrados.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-slate-100 bg-white">
                <span className="text-xs text-slate-500 font-medium">
                  Mostrando {(paginaActual - 1) * itemsPorPagina + 1} -{' '}
                  {Math.min(paginaActual * itemsPorPagina, filtrados.length)} de {filtrados.length} productos
                </span>
                {totalPaginas > 1 && (
                  <Pagination
                    total={totalPaginas}
                    value={paginaActual}
                    onChange={setPaginaActual}
                    size="sm"
                    radius="xl"
                    color="indigo"
                  />
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Vista de Gestion de Categorias */
        <GestionCategorias onActualizacionCategorias={manejarActualizacionCategorias} />
      )}

      {/* Modal Formulario Producto con Diseño Limpio, Armónico y Compacto */}
      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
              <IconPackage size={18} stroke={2} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                {productoEnEdicion ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Información comercial e inventario</p>
            </div>
          </div>
        }
        centered
        radius={24}
        size="lg"
        classNames={{
          header: 'border-b border-slate-100 py-3.5 px-5',
          body: '!p-0',
          content: '!rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]',
        }}
      >
        {/* Cuerpo del formulario organizado */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-130px)]">
          {/* Bloque Superior: Foto a la izquierda y Datos del Producto a la derecha */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* 1. Selector / Vista Previa de Imagen Cuadrada */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 w-full sm:w-auto">
              <input
                type="file"
                id="subir-foto-producto"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (archivo) {
                    const lector = new FileReader();
                    lector.onload = (evento) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let { width, height } = img;
                        const maxDim = 600;
                        if (width > maxDim || height > maxDim) {
                          if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                          } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                          }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        setFormImagen(canvas.toDataURL('image/jpeg', 0.85));
                      };
                      img.src = evento.target.result;
                    };
                    lector.readAsDataURL(archivo);
                  }
                }}
              />

              <label
                htmlFor="subir-foto-producto"
                className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/20 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group shadow-2xs"
              >
                {formImagen ? (
                  <>
                    <img
                      src={formImagen}
                      alt="Producto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                      <IconUpload size={18} />
                      <span>Cambiar</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-2 text-slate-400 group-hover:text-teal-600 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-teal-600 shadow-2xs mb-1">
                      <IconPhoto size={20} stroke={1.5} />
                    </div>
                    <span className="text-[11px] font-bold">Subir foto</span>
                    <span className="text-[9px] text-slate-400">JPG, PNG</span>
                  </div>
                )}
              </label>

              {formImagen && (
                <button
                  type="button"
                  onClick={() => setFormImagen('')}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Quitar foto
                </button>
              )}
            </div>

            {/* 2. Datos Principales (Nombre, Código, Categoría) */}
            <div className="flex-1 w-full space-y-3">
              <TextInput
                label="Nombre / Descripción del Producto"
                placeholder="Ej. Coca Cola Original 600ml"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                required
                size="sm"
                radius="md"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <TextInput
                  label="Código de Barras"
                  placeholder="Ej. 7501055300075"
                  leftSection={<IconBarcode size={16} className="text-slate-400" />}
                  value={formCodigo}
                  onChange={(e) => setFormCodigo(e.target.value)}
                  required
                  size="sm"
                  radius="md"
                />

                <Select
                  label="Categoría"
                  data={categorias.map((c) => ({ value: c.nombre, label: c.nombre }))}
                  value={formCategoria}
                  onChange={(val) => setFormCategoria(val || categorias[0]?.nombre || 'General')}
                  size="sm"
                  radius="md"
                  renderOption={({ option }) => {
                    const catInfo = categorias.find((c) => c.nombre === option.value);
                    return (
                      <Group gap="xs">
                        <Badge color={catInfo?.color || 'blue'} size="xs" variant="filled">
                          {option.label}
                        </Badge>
                      </Group>
                    );
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bloque Inferior: Precios, Costos e Inventario */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Precios e Inventario
              </span>

              {/* Indicador dinámico de margen de ganancia */}
              {formPrecio > 0 && formCosto > 0 && (
                <Badge
                  size="sm"
                  variant="light"
                  color={formPrecio >= formCosto ? 'teal' : 'red'}
                  radius="sm"
                  className="font-mono"
                >
                  Margen: {(((formPrecio - formCosto) / formPrecio) * 100).toFixed(1)}% ({formatearMoneda(formPrecio - formCosto)})
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumberInput
                label="Costo de Compra ($)"
                placeholder="0.00"
                value={formCosto}
                onChange={(val) => setFormCosto(typeof val === 'number' ? val : 0)}
                min={0}
                decimalScale={2}
                fixedDecimalScale
                hideControls
                prefix="$ "
                size="sm"
                radius="md"
                classNames={{ input: 'font-mono font-bold text-slate-800' }}
              />

              <NumberInput
                label="Precio de Venta ($) *"
                placeholder="0.00"
                value={formPrecio}
                onChange={(val) => setFormPrecio(typeof val === 'number' ? val : 0)}
                min={0}
                decimalScale={2}
                fixedDecimalScale
                hideControls
                prefix="$ "
                size="sm"
                radius="md"
                required
                classNames={{ input: 'font-mono font-bold text-emerald-700' }}
              />

              <NumberInput
                label="Stock Inicial"
                placeholder="0"
                value={formStock}
                onChange={(val) => setFormStock(typeof val === 'number' ? val : 0)}
                min={0}
                hideControls
                suffix=" pzas"
                size="sm"
                radius="md"
                classNames={{ input: 'font-mono font-bold text-slate-800' }}
              />
            </div>
          </div>
        </div>

        {/* Footer fijo con botones de acción siempre visibles */}
        <div className="border-t border-slate-100 px-5 py-3.5 bg-slate-50/80 flex items-center justify-end gap-2.5 rounded-b-3xl">
          <Button variant="default" radius="xl" onClick={() => setModalAbierto(false)}>
            Cancelar
          </Button>
          <Button color="teal" radius="xl" className="font-bold shadow-md shadow-teal-500/15" onClick={guardarProducto}>
            Guardar Producto
          </Button>
        </div>
      </Modal>

      {/* Modal de confirmacion con componentes UI */}
      <ModalConfirmacion
        abierto={Boolean(productoAEliminar)}
        alCerrar={() => setProductoAEliminar(null)}
        alConfirmar={confirmarEliminarProducto}
        titulo="¿Eliminar producto?"
        mensaje={`¿Estás seguro de que deseas eliminar "${productoAEliminar?.nombre}" del inventario? Esta acción no se puede revertir.`}
        textoConfirmar="Eliminar Producto"
        color="red"
        icono={IconTrash}
      />
    </div>
  );
};
