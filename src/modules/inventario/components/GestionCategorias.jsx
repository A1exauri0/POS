import { useState } from 'react';
import {
  Table,
  Button,
  TextInput,
  Textarea,
  Select,
  Badge,
  Modal,
  Group,
  ActionIcon,
  Tooltip,
  Text,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCategory,
  IconSearch,
  IconPackage,
  IconPalette,
  IconCheck,
} from '@tabler/icons-react';
import {
  obtenerCategorias,
  cargarCategoriasBD,
  guardarCategoriaBD,
  eliminarCategoriaBD,
  guardarCategorias,
  obtenerProductos,
  cargarProductosBD,
  guardarProductos,
} from '../../../services/productoServicio';
import { notifications } from '@mantine/notifications';
import { ModalConfirmacion } from '../../../components/ModalConfirmacion';

const COLORES_DISPONIBLES = [
  { value: 'blue', label: 'Azul' },
  { value: 'teal', label: 'Verde Azulado' },
  { value: 'yellow', label: 'Amarillo' },
  { value: 'indigo', label: 'Índigo' },
  { value: 'orange', label: 'Naranja' },
  { value: 'cyan', label: 'Cian' },
  { value: 'pink', label: 'Rosa' },
  { value: 'violet', label: 'Violeta' },
  { value: 'lime', label: 'Lima' },
  { value: 'red', label: 'Rojo' },
  { value: 'gray', label: 'Gris' },
];

export const GestionCategorias = ({ onActualizacionCategorias }) => {
  const [categorias, setCategorias] = useState(() => obtenerCategorias());
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null);
  const [formNombre, setFormNombre] = useState('');
  const [formColor, setFormColor] = useState('blue');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [errorNombre, setErrorNombre] = useState('');

  const abrirModalNueva = () => {
    setCategoriaEnEdicion(null);
    setFormNombre('');
    setFormColor('blue');
    setFormDescripcion('');
    setErrorNombre('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (cat) => {
    setCategoriaEnEdicion(cat);
    setFormNombre(cat.nombre);
    setFormColor(cat.color || 'blue');
    setFormDescripcion(cat.descripcion || '');
    setErrorNombre('');
    setModalAbierto(true);
  };

  // Cambio rapido de color directamente desde el listado
  const cambiarColorDirecto = async (catId, nuevoColor) => {
    if (!nuevoColor) return;

    const catActual = categorias.find((c) => c.id === catId);
    if (!catActual) return;

    const catActualizada = { ...catActual, color: nuevoColor };
    const listaActualizada = await guardarCategoriaBD(catActualizada);
    setCategorias(listaActualizada);

    if (onActualizacionCategorias) {
      onActualizacionCategorias(listaActualizada);
    }

    notifications.show({
      title: 'Color Actualizado',
      message: `El color de "${catActualizada.nombre}" se actualizó correctamente.`,
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
  };

  // Guardar creacion o edicion completa en SQLite
  const guardarCategoria = async () => {
    const nombreLimpio = formNombre.trim();
    if (!nombreLimpio) {
      setErrorNombre('El nombre de la categoría es obligatorio');
      return;
    }

    // Validar nombre duplicado
    const existeDuplicado = categorias.some(
      (c) =>
        c.nombre.toLowerCase() === nombreLimpio.toLowerCase() &&
        (!categoriaEnEdicion || c.id !== categoriaEnEdicion.id)
    );

    if (existeDuplicado) {
      setErrorNombre('Ya existe una categoría con este nombre');
      return;
    }

    let categoriaAGuardar;
    if (categoriaEnEdicion) {
      const nombreAnterior = categoriaEnEdicion.nombre;
      categoriaAGuardar = {
        ...categoriaEnEdicion,
        nombre: nombreLimpio,
        color: formColor,
        descripcion: formDescripcion.trim(),
      };

      // Si se cambio el nombre, actualizar productos asociados
      if (nombreAnterior !== nombreLimpio) {
        const productosActualizados = productos.map((p) =>
          p.categoria === nombreAnterior
            ? { ...p, categoria: nombreLimpio, colorCategoria: formColor }
            : p
        );
        setProductos(productosActualizados);
        guardarProductos(productosActualizados);
      }
    } else {
      // Crear nueva categoria
      categoriaAGuardar = {
        id: `cat-${Date.now()}`,
        nombre: nombreLimpio,
        color: formColor,
        descripcion: formDescripcion.trim(),
      };
    }

    const listaActualizada = await guardarCategoriaBD(categoriaAGuardar);
    setCategorias(listaActualizada);
    setModalAbierto(false);

    if (onActualizacionCategorias) {
      onActualizacionCategorias(listaActualizada);
    }

    notifications.show({
      title: categoriaEnEdicion ? 'Categoría Actualizada' : 'Categoría Guardada',
      message: `La categoría "${nombreLimpio}" se ha guardado correctamente.`,
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
  };

  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  // Eliminar categoria con confirmacion en SQLite
  const confirmarEliminarCategoria = async () => {
    if (!categoriaAEliminar) return;
    const cat = categoriaAEliminar;
    const productosEnEstaCategoria = productos.filter((p) => p.categoria === cat.nombre);

    // Reasignar productos a General
    if (productosEnEstaCategoria.length > 0) {
      const productosActualizados = productos.map((p) =>
        p.categoria === cat.nombre ? { ...p, categoria: 'General' } : p
      );
      setProductos(productosActualizados);
      guardarProductos(productosActualizados);
    }

    const listaActualizada = await eliminarCategoriaBD(cat.id);
    setCategorias(listaActualizada);

    if (onActualizacionCategorias) {
      onActualizacionCategorias(listaActualizada);
    }

    notifications.show({
      title: 'Categoría eliminada',
      message: `La categoría "${cat.nombre}" fue eliminada.`,
      color: 'red',
    });
    setCategoriaAEliminar(null);
  };

  // Filtrar categorias
  const categoriasFiltradas = categorias.filter(
    (c) =>
      c.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col gap-3.5 overflow-hidden">
      {/* Barra de busqueda y boton nueva categoria */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <TextInput
            placeholder="Buscar categoría..."
            leftSection={<IconSearch size={16} />}
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            size="sm"
            className="w-72"
          />
          <Text size="xs" c="dimmed">
            {categorias.length} categorías registradas
          </Text>
        </div>

        <Button
          color="indigo"
          leftSection={<IconPlus size={18} />}
          onClick={abrirModalNueva}
        >
          Nueva Categoría
        </Button>
      </div>

      {/* Tabla de categorias */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-y-auto">
        <Table highlightOnHover verticalSpacing="md" stickyHeader className="w-full">
          <Table.Thead className="bg-slate-50/80 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
            <Table.Tr>
              <Table.Th className="w-1/4">Categoría</Table.Th>
              <Table.Th className="w-1/5">Color / Etiqueta</Table.Th>
              <Table.Th className="min-w-[200px]">Descripción</Table.Th>
              <Table.Th className="w-44">Productos Asignados</Table.Th>
              <Table.Th className="w-24 text-right">Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categoriasFiltradas.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                  No se encontraron categorías.
                </Table.Td>
              </Table.Tr>
            ) : (
              categoriasFiltradas.map((cat) => {
                const totalProds = productos.filter((p) => p.categoria === cat.nombre).length;

                return (
                  <Table.Tr key={cat.id} className="text-sm text-slate-800 hover:bg-slate-50/80 transition-colors">
                    <Table.Td className="font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                          <IconCategory size={16} />
                        </div>
                        <span className="font-bold">{cat.nombre}</span>
                      </div>
                    </Table.Td>

                    {/* Selector interactivo directo de color en el listado */}
                    <Table.Td>
                      <Select
                        size="xs"
                        className="w-44"
                        radius="md"
                        leftSection={<IconPalette size={14} />}
                        value={cat.color || 'blue'}
                        data={COLORES_DISPONIBLES}
                        onChange={(nuevoColor) => cambiarColorDirecto(cat.id, nuevoColor)}
                        renderOption={({ option }) => (
                          <Group gap="xs">
                            <Badge color={option.value} size="xs" variant="filled">
                              {option.label}
                            </Badge>
                          </Group>
                        )}
                      />
                    </Table.Td>

                    <Table.Td className="text-slate-600 text-xs font-normal">
                      {cat.descripcion || <span className="text-slate-400 italic">Sin descripción</span>}
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        variant="light"
                        color={totalProds > 0 ? 'teal' : 'gray'}
                        size="sm"
                        leftSection={<IconPackage size={12} />}
                      >
                        {totalProds} {totalProds === 1 ? 'producto' : 'productos'}
                      </Badge>
                    </Table.Td>

                    <Table.Td className="text-right">
                      <Group gap="xs" justify="flex-end">
                        <Tooltip label="Editar datos de categoría">
                          <ActionIcon
                            variant="subtle"
                            color="indigo"
                            onClick={() => abrirModalEditar(cat)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Eliminar categoría">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => setCategoriaAEliminar(cat)}
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

      {/* Modal de Creacion / Edicion de Categoria */}
      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={
          <span className="font-bold text-slate-800">
            {categoriaEnEdicion ? 'Editar Categoría' : 'Nueva Categoría'}
          </span>
        }
        centered
        radius="lg"
      >
        <div className="space-y-3.5 pt-1">
          <TextInput
            label="Nombre de la Categoría"
            placeholder="Ej. Bebidas, Botanas, Limpieza..."
            value={formNombre}
            onChange={(e) => {
              setFormNombre(e.target.value);
              if (errorNombre) setErrorNombre('');
            }}
            error={errorNombre}
            required
          />

          <Select
            label="Color de la Etiqueta"
            data={COLORES_DISPONIBLES}
            value={formColor}
            onChange={(val) => setFormColor(val || 'blue')}
            renderOption={({ option }) => (
              <Group gap="xs">
                <Badge color={option.value} size="xs" variant="filled">
                  {option.label}
                </Badge>
              </Group>
            )}
          />

          <Textarea
            label="Descripción / Notas (Opcional)"
            placeholder="Breve detalle de qué tipo de productos incluye..."
            rows={3}
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
          />

          <Group justify="flex-end" pt="sm">
            <Button variant="default" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button color="indigo" onClick={guardarCategoria}>
              Guardar Categoría
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Modal de confirmacion con componentes UI */}
      <ModalConfirmacion
        abierto={Boolean(categoriaAEliminar)}
        alCerrar={() => setCategoriaAEliminar(null)}
        alConfirmar={confirmarEliminarCategoria}
        titulo="¿Eliminar categoría?"
        mensaje={`¿Estás seguro de eliminar la categoría "${categoriaAEliminar?.nombre}"? Los productos asignados pasarán a la categoría "General".`}
        textoConfirmar="Eliminar Categoría"
        color="red"
        icono={IconTrash}
      />
    </div>
  );
};
