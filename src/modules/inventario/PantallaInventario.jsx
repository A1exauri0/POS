import { useState, useMemo } from 'react';
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
  guardarProductos,
  obtenerCategorias,
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

  const guardarProducto = () => {
    if (!formNombre.trim() || !formCodigo.trim()) return;

    let listaActualizada;
    if (productoEnEdicion) {
      listaActualizada = productos.map((p) =>
        p.id === productoEnEdicion.id
          ? {
              ...p,
              codigo: formCodigo,
              nombre: formNombre,
              categoria: formCategoria || 'General',
              precio: formPrecio,
              costo: formCosto,
              stock: formStock,
              imagen: formImagen.trim(),
            }
          : p
      );
    } else {
      const nuevo = {
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
      listaActualizada = [nuevo, ...productos];
    }

    setProductos(listaActualizada);
    guardarProductos(listaActualizada);
    setModalAbierto(false);
  };

  const confirmarEliminarProducto = () => {
    if (!productoAEliminar) return;
    const listaActualizada = productos.filter((p) => p.id !== productoAEliminar.id);
    setProductos(listaActualizada);
    guardarProductos(listaActualizada);
    setProductoAEliminar(null);
  };

  const manejarActualizacionCategorias = (nuevasCategorias) => {
    setCategorias(nuevasCategorias);
    setProductos(obtenerProductos()); // Refrescar productos en caso de reasignaciones
  };

  const filtrados = useMemo(() => {
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        p.codigo.includes(terminoBusqueda) ||
        p.categoria.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );
  }, [productos, terminoBusqueda]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-3.5 overflow-hidden">
      {/* Pestañas de navegacion entre Productos y Categorias */}
      <div className="bg-white px-4 pt-2 rounded-xl border border-slate-200 shadow-xs">
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
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <TextInput
                placeholder="Buscar por código, nombre o categoría..."
                leftSection={<IconSearch size={16} />}
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                size="sm"
                className="w-80"
              />
              <span className="text-xs text-slate-500 font-medium">
                {productos.length} productos registrados
              </span>
            </div>

            <Button
              color="teal"
              leftSection={<IconPlus size={18} />}
              onClick={abrirModalNuevo}
            >
              Nuevo Producto
            </Button>
          </div>

          {/* Tabla de Productos con Columna de Imagen */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-y-auto">
            <Table highlightOnHover verticalSpacing="sm" stickyHeader>
              <Table.Thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <Table.Tr>
                  <Table.Th className="w-24">Imagen</Table.Th>
                  <Table.Th>Código</Table.Th>
                  <Table.Th>Nombre del Producto</Table.Th>
                  <Table.Th>Categoría</Table.Th>
                  <Table.Th>Costo</Table.Th>
                  <Table.Th>Precio Venta</Table.Th>
                  <Table.Th>Stock Actual</Table.Th>
                  <Table.Th className="text-right">Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtrados.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={8} className="text-center py-8 text-slate-400 text-sm">
                      No se encontraron productos.
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filtrados.map((prod) => {
                    const sinStock = prod.stock <= 0;
                    const stockBajo = prod.stock > 0 && prod.stock <= 10;
                    const catObj = categorias.find((c) => c.nombre === prod.categoria);
                    const tieneImg = Boolean(prod.imagen && prod.imagen.trim());

                    return (
                      <Table.Tr key={prod.id} className="text-sm text-slate-800">
                        {/* Miniatura de Imagen Ampliada o Icono Placeholder */}
                        <Table.Td>
                          <div className="w-20 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
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
                              <IconPhoto size={24} stroke={1.5} />
                            </div>
                          </div>
                        </Table.Td>

                        <Table.Td className="font-mono text-xs font-semibold text-slate-600">
                          {prod.codigo}
                        </Table.Td>
                        <Table.Td className="font-medium text-slate-900">{prod.nombre}</Table.Td>
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
        </>
      ) : (
        /* Vista de Gestion de Categorias */
        <GestionCategorias onActualizacionCategorias={manejarActualizacionCategorias} />
      )}

      {/* Modal Formulario Producto con soporte de Imagen */}
      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={
          <span className="font-bold text-slate-800">
            {productoEnEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </span>
        }
        centered
        radius="lg"
      >
        <div className="space-y-3.5 pt-2">
          <TextInput
            label="Código de Barras"
            placeholder="Ej. 7501055300075"
            leftSection={<IconBarcode size={18} />}
            value={formCodigo}
            onChange={(e) => setFormCodigo(e.target.value)}
            required
          />

          <TextInput
            label="Nombre / Descripción del Producto"
            placeholder="Ej. Leche Entera 1L"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
          />

          <Select
            label="Categoría"
            data={categorias.map((c) => ({ value: c.nombre, label: c.nombre }))}
            value={formCategoria}
            onChange={(val) => setFormCategoria(val || categorias[0]?.nombre || 'General')}
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

          {/* Campo de Imagen y Vista Previa Ampliada */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Imagen del Producto</span>

            <input
              type="file"
              id="subir-foto-producto"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) {
                  const lector = new FileReader();
                  lector.onloadend = () => {
                    setFormImagen(lector.result);
                  };
                  lector.readAsDataURL(archivo);
                }
              }}
            />

            {formImagen ? (
              /* Vista previa en tamaño amplio */
              <div className="w-full h-44 rounded-xl border border-slate-200 bg-white overflow-hidden relative flex items-center justify-center shadow-inner group">
                <img
                  src={formImagen}
                  alt="Vista previa de producto"
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/65 backdrop-blur-xs p-1 rounded-lg shadow-md">
                  <label
                    htmlFor="subir-foto-producto"
                    className="px-2.5 py-1 bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold rounded cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <IconUpload size={13} /> Cambiar
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormImagen('')}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              /* Area para subir imagen interactiva */
              <label
                htmlFor="subir-foto-producto"
                className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors text-slate-500 hover:text-indigo-600"
              >
                <div className="p-2 rounded-full bg-slate-100 text-slate-400">
                  <IconPhoto size={28} stroke={1.5} />
                </div>
                <span className="text-xs font-semibold">
                  Haz clic aquí para subir una foto desde tu equipo
                </span>
                <span className="text-[11px] text-slate-400">
                  Formatos JPG, PNG, WEBP
                </span>
              </label>
            )}

            <TextInput
              placeholder="O ingresa la ruta local (ej. /images/productos/foto.jpg)"
              value={formImagen}
              onChange={(e) => setFormImagen(e.target.value)}
              size="xs"
              leftSection={<IconPhoto size={14} className="text-slate-400" />}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <NumberInput
              label="Costo ($)"
              value={formCosto}
              onChange={(val) => setFormCosto(typeof val === 'number' ? val : 0)}
              min={0}
              decimalScale={2}
            />

            <NumberInput
              label="Precio Venta ($)"
              value={formPrecio}
              onChange={(val) => setFormPrecio(typeof val === 'number' ? val : 0)}
              min={0}
              decimalScale={2}
              required
            />

            <NumberInput
              label="Stock Inicial"
              value={formStock}
              onChange={(val) => setFormStock(typeof val === 'number' ? val : 0)}
              min={0}
            />
          </div>

          <Group justify="flex-end" pt="md">
            <Button variant="default" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button color="teal" onClick={guardarProducto}>
              Guardar Producto
            </Button>
          </Group>
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
