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
} from '@tabler/icons-react';
import {
  obtenerCategorias,
  guardarCategorias,
  obtenerProductos,
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
  const cambiarColorDirecto = (catId, nuevoColor) => {
    if (!nuevoColor) return;

    const listaActualizada = categorias.map((c) =>
      c.id === catId ? { ...c, color: nuevoColor } : c
    );

    setCategorias(listaActualizada);
    guardarCategorias(listaActualizada);

    if (onActualizacionCategorias) {
      onActualizacionCategorias(listaActualizada);
    }

    const catModificada = listaActualizada.find((c) => c.id === catId);
    notifications.show({
      title: 'Color Actualizado',
      message: `El color de "${catModificada?.nombre}" cambió correctamente`,
      color: nuevoColor,
      autoClose: 2000,
    });
  };

  // Guardar creacion o edicion completa
  const guardarCategoria = () => {
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

    let listaActualizada;

    if (categoriaEnEdicion) {
      const nombreAnterior = categoriaEnEdicion.nombre;

      // Actualizar categoria
      listaActualizada = categorias.map((c) =>
        c.id === categoriaEnEdicion.id
          ? {
              ...c,
              nombre: nombreLimpio,
              color: formColor,
              descripcion: formDescripcion.trim(),
            }
          : c
      );

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
      const nueva = {
        id: `cat-${Date.now()}`,
        nombre: nombreLimpio,
        color: formColor,
        descripcion: formDescripcion.trim(),
      };
      listaActualizada = [...categorias, nueva];
    }

    setCategorias(listaActualizada);
    guardarCategorias(listaActualizada);
    setModalAbierto(false);

    if (onActualizacionCategorias) {
      onActualizacionCategorias(listaActualizada);
    }

    notifications.show({
      title: categoriaEnEdicion ? 'Categoría actualizada' : 'Categoría creada',
      message: `La categoría "${nombreLimpio}" se guardó correctamente`,
      color: 'teal',
    });
  };

  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  // Eliminar categoria con confirmacion
  const confirmarEliminarCategoria = () => {
    if (!categoriaAEliminar) return;
    const cat = categoriaAEliminar;
    const productosEnEstaCategoria = productos.filter((p) => p.categoria === cat.nombre);
    const listaActualizada = categorias.filter((c) => c.id !== cat.id);

    // Reasignar productos a General
    if (productosEnEstaCategoria.length > 0) {
      const productosActualizados = productos.map((p) =>
        p.categoria === cat.nombre ? { ...p, categoria: 'General' } : p
      );
      setProductos(productosActualizados);
      guardarProductos(productosActualizados);
    }

    setCategorias(listaActualizada);
    guardarCategorias(listaActualizada);

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
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-y-auto">
        <Table highlightOnHover verticalSpacing="sm" stickyHeader>
          <Table.Thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Table.Tr>
              <Table.Th>Categoría</Table.Th>
              <Table.Th>Cambiar Color / Etiqueta</Table.Th>
              <Table.Th>Descripción</Table.Th>
              <Table.Th>Productos Asignados</Table.Th>
              <Table.Th className="text-right">Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categoriasFiltradas.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} className="text-center py-8 text-slate-400 text-sm">
                  No se encontraron categorías.
                </Table.Td>
              </Table.Tr>
            ) : (
              categoriasFiltradas.map((cat) => {
                const totalProds = productos.filter((p) => p.categoria === cat.nombre).length;

                return (
                  <Table.Tr key={cat.id} className="text-sm text-slate-800">
                    <Table.Td className="font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <IconCategory size={18} className="text-slate-400" />
                        <span>{cat.nombre}</span>
                      </div>
                    </Table.Td>

                    {/* Selector interactivo directo de color en el listado */}
                    <Table.Td>
                      <Select
                        size="xs"
                        className="w-40"
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

                    <Table.Td className="text-slate-500 text-xs max-w-xs truncate">
                      {cat.descripcion || 'Sin descripción'}
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
