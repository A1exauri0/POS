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
} from '@tabler/icons-react';
import {
  obtenerProductos,
  guardarProductos,
  obtenerCategorias,
} from '../../services/productoServicio';
import { formatearMoneda } from '../../utils/formateadores';
import { GestionCategorias } from './components/GestionCategorias';

export const PantallaInventario = () => {
  const [pestanaActiva, setPestanaActiva] = useState('productos');
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [categorias, setCategorias] = useState(() => obtenerCategorias());
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  // Formulario temporal de producto
  const [formCodigo, setFormCodigo] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formPrecio, setFormPrecio] = useState(0);
  const [formCosto, setFormCosto] = useState(0);
  const [formStock, setFormStock] = useState(0);

  const abrirModalNuevo = () => {
    setProductoEnEdicion(null);
    setFormCodigo(`750${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormNombre('');
    setFormCategoria(categorias[0]?.nombre || 'General');
    setFormPrecio(0);
    setFormCosto(0);
    setFormStock(10);
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
      };
      listaActualizada = [nuevo, ...productos];
    }

    setProductos(listaActualizada);
    guardarProductos(listaActualizada);
    setModalAbierto(false);
  };

  const eliminarProducto = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto del inventario?')) {
      const listaActualizada = productos.filter((p) => p.id !== id);
      setProductos(listaActualizada);
      guardarProductos(listaActualizada);
    }
  };

  const manejarActualizacionCategorias = (nuevasCategorias) => {
    setCategorias(nuevasCategorias);
    setProductos(obtenerProductos()); // Refrescar productos en caso de reasignaciones
  };

  const filtrados = useMemo(() => {
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        p.codigo.includes(terminoBusqueda)
    );
  }, [productos, terminoBusqueda]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-3.5 overflow-hidden">
      {/* Encabezado principal del modulo */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <IconPackage size={24} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-tight">
              Gestión de Inventario y Catálogos
            </h2>
            <p className="text-xs text-slate-500">
              Control de existencias, productos y categorías
            </p>
          </div>
        </div>

        {/* Pestañas de navegacion entre Productos y Categorias */}
        <Tabs
          value={pestanaActiva}
          onChange={setPestanaActiva}
          color="indigo"
          variant="pills"
          radius="md"
        >
          <Tabs.List>
            <Tabs.Tab value="productos" leftSection={<IconPackage size={16} />}>
              Productos ({productos.length})
            </Tabs.Tab>
            <Tabs.Tab value="categorias" leftSection={<IconCategory size={16} />}>
              Categorías ({categorias.length})
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>

      {/* Pestaña: Catalogo de Productos */}
      {pestanaActiva === 'productos' && (
        <div className="flex-1 flex flex-col gap-3.5 overflow-hidden">
          {/* Barra de busqueda y nuevo producto */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <TextInput
              placeholder="Buscar por nombre o código de barras..."
              leftSection={<IconSearch size={16} />}
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              size="sm"
              className="w-72"
            />

            <Button
              color="teal"
              leftSection={<IconPlus size={18} />}
              onClick={abrirModalNuevo}
            >
              Nuevo Producto
            </Button>
          </div>

          {/* Tabla de Productos */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-y-auto">
            <Table highlightOnHover verticalSpacing="sm" stickyHeader>
              <Table.Thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <Table.Tr>
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
                    <Table.Td colSpan={7} className="text-center py-8 text-slate-400 text-sm">
                      No se encontraron productos.
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filtrados.map((prod) => {
                    const sinStock = prod.stock <= 0;
                    const stockBajo = prod.stock > 0 && prod.stock <= 10;
                    const catObj = categorias.find((c) => c.nombre === prod.categoria);

                    return (
                      <Table.Tr key={prod.id} className="text-sm text-slate-800">
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
                                onClick={() => eliminarProducto(prod.id)}
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
        </div>
      )}

      {/* Pestaña: Gestion de Categorias */}
      {pestanaActiva === 'categorias' && (
        <GestionCategorias onActualizacionCategorias={manejarActualizacionCategorias} />
      )}

      {/* Modal Formulario de Producto */}
      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={
          <span className="font-bold text-slate-800">
            {productoEnEdicion ? 'Editar Producto' : 'Registrar Nuevo Producto'}
          </span>
        }
        centered
        radius="lg"
      >
        <div className="space-y-3 pt-2">
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
    </div>
  );
};
