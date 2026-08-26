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
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconPackage,
  IconBarcode,
} from '@tabler/icons-react';
import {
  obtenerProductos,
  guardarProductos,
  CATEGORIAS_PRODUCTOS,
} from '../../services/productoServicio';
import { formatearMoneda } from '../../utils/formateadores';

export const PantallaInventario = () => {
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  // Formulario temporal
  const [formCodigo, setFormCodigo] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formCategoria, setFormCategoria] = useState('Abarrotes');
  const [formPrecio, setFormPrecio] = useState(0);
  const [formCosto, setFormCosto] = useState(0);
  const [formStock, setFormStock] = useState(0);

  const abrirModalNuevo = () => {
    setProductoEnEdicion(null);
    setFormCodigo(`750${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormNombre('');
    setFormCategoria('Abarrotes');
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
              categoria: formCategoria,
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
        categoria: formCategoria,
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

  const filtrados = useMemo(() => {
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        p.codigo.includes(terminoBusqueda)
    );
  }, [productos, terminoBusqueda]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-hidden">
      {/* Encabezado del modulo de inventario */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
            <IconPackage size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Catálogo de Inventario</h2>
            <p className="text-xs text-slate-500">
              {productos.length} productos registrados en la base de datos local
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TextInput
            placeholder="Buscar por nombre o código..."
            leftSection={<IconSearch size={16} />}
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            size="sm"
            className="w-64"
          />

          <Button
            color="teal"
            leftSection={<IconPlus size={18} />}
            onClick={abrirModalNuevo}
          >
            Nuevo Producto
          </Button>
        </div>
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
            {filtrados.map((prod) => {
              const sinStock = prod.stock <= 0;
              const stockBajo = prod.stock > 0 && prod.stock <= 10;

              return (
                <Table.Tr key={prod.id} className="text-sm text-slate-800">
                  <Table.Td className="font-mono text-xs font-semibold text-slate-600">
                    {prod.codigo}
                  </Table.Td>
                  <Table.Td className="font-medium text-slate-900">{prod.nombre}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="indigo" size="sm">
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
            })}
          </Table.Tbody>
        </Table>
      </div>

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
            data={CATEGORIAS_PRODUCTOS.filter((c) => c !== 'Todos')}
            value={formCategoria}
            onChange={(val) => setFormCategoria(val || 'Abarrotes')}
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
