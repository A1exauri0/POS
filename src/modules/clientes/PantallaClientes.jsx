import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  TextInput,
  Badge,
  Modal,
  Group,
  ActionIcon,
  Tooltip,
  Text,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconUsers,
  IconPhone,
  IconLock,
} from '@tabler/icons-react';
import {
  obtenerClientes,
  guardarClientes,
} from '../../services/clienteServicio';
import { notifications } from '@mantine/notifications';
import { ModalConfirmacion } from '../../components/ModalConfirmacion';

export const PantallaClientes = () => {
  const [clientes, setClientes] = useState(() => obtenerClientes());
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  // Formulario simplificado: solo Nombre y Telefono
  const [formNombre, setFormNombre] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [errorNombre, setErrorNombre] = useState('');

  const abrirModalNuevo = () => {
    setClienteEnEdicion(null);
    setFormNombre('');
    setFormTelefono('');
    setErrorNombre('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (cli) => {
    setClienteEnEdicion(cli);
    setFormNombre(cli.nombre);
    setFormTelefono(cli.telefono === 'Sin teléfono' ? '' : cli.telefono || '');
    setErrorNombre('');
    setModalAbierto(true);
  };

  const guardarCliente = () => {
    const nombreLimpio = formNombre.trim();
    if (!nombreLimpio) {
      setErrorNombre('El nombre del cliente es obligatorio');
      return;
    }

    let listaActualizada;
    if (clienteEnEdicion) {
      listaActualizada = clientes.map((c) =>
        c.id === clienteEnEdicion.id
          ? {
              ...c,
              nombre: nombreLimpio,
              telefono: formTelefono.trim() || 'Sin teléfono',
            }
          : c
      );
    } else {
      const nuevo = {
        id: `cli-${Date.now()}`,
        nombre: nombreLimpio,
        telefono: formTelefono.trim() || 'Sin teléfono',
        esPredeterminado: false,
      };
      listaActualizada = [...clientes, nuevo];
    }

    setClientes(listaActualizada);
    guardarClientes(listaActualizada);
    setModalAbierto(false);

    notifications.show({
      title: clienteEnEdicion ? 'Cliente Actualizado' : 'Cliente Registrado',
      message: `"${nombreLimpio}" se guardó correctamente`,
      color: 'teal',
    });
  };

  const solicitarEliminarCliente = (cli) => {
    if (cli.esPredeterminado || cli.id === 'cli-1') {
      notifications.show({
        title: 'Acción no permitida',
        message: 'El cliente "Público General" es el cliente predeterminado del sistema y no puede eliminarse.',
        color: 'red',
      });
      return;
    }
    setClienteAEliminar(cli);
  };

  const confirmarEliminarCliente = () => {
    if (!clienteAEliminar) return;
    const listaActualizada = clientes.filter((c) => c.id !== clienteAEliminar.id);
    setClientes(listaActualizada);
    guardarClientes(listaActualizada);

    notifications.show({
      title: 'Cliente Eliminado',
      message: `El cliente "${clienteAEliminar.nombre}" fue retirado del sistema.`,
      color: 'red',
    });
    setClienteAEliminar(null);
  };

  const filtrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return clientes;
    const normalizado = terminoBusqueda.trim().toLowerCase();

    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(normalizado) ||
        (c.telefono && c.telefono.includes(normalizado))
    );
  }, [clientes, terminoBusqueda]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-hidden">
      {/* Encabezado del modulo unificado */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <IconUsers size={22} stroke={2} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
              Catálogo de Clientes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {clientes.length} clientes registrados en el sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TextInput
            placeholder="Buscar por nombre o teléfono..."
            leftSection={<IconSearch size={16} className="text-slate-400" />}
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            size="sm"
            radius="xl"
            className="w-72"
          />

          <Button
            color="indigo"
            radius="xl"
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={abrirModalNuevo}
            className="font-bold shadow-md shadow-indigo-500/15"
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Tabla de Clientes Simplificada */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-y-auto">
        <Table highlightOnHover verticalSpacing="sm" stickyHeader>
          <Table.Thead className="bg-slate-50/80 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
            <Table.Tr>
              <Table.Th>Nombre / Razón Social</Table.Th>
              <Table.Th>Teléfono</Table.Th>
              <Table.Th className="text-right">Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtrados.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3} className="text-center py-12 text-slate-400 text-sm">
                  No se encontraron clientes registrados.
                </Table.Td>
              </Table.Tr>
            ) : (
              filtrados.map((cli) => {
                const esDefault = cli.esPredeterminado || cli.id === 'cli-1';

                return (
                  <Table.Tr key={cli.id} className="text-sm text-slate-800">
                    <Table.Td className="font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{cli.nombre}</span>
                        {esDefault && (
                          <Badge color="dark" size="xs" variant="filled" radius="sm">
                            Predeterminado
                          </Badge>
                        )}
                      </div>
                    </Table.Td>

                    <Table.Td className="text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-1.5">
                        <IconPhone size={14} className="text-slate-400" />
                        <span>{cli.telefono || 'Sin teléfono'}</span>
                      </div>
                    </Table.Td>

                    <Table.Td className="text-right">
                      <Group gap="xs" justify="flex-end">
                        <Tooltip label="Editar cliente">
                          <ActionIcon
                            variant="subtle"
                            color="indigo"
                            radius="md"
                            onClick={() => abrirModalEditar(cli)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>

                        {esDefault ? (
                          <Tooltip label="Cliente predeterminado (No eliminable)">
                            <ActionIcon variant="subtle" color="gray" radius="md" disabled>
                              <IconLock size={16} />
                            </ActionIcon>
                          </Tooltip>
                        ) : (
                          <Tooltip label="Eliminar cliente">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              radius="md"
                              onClick={() => solicitarEliminarCliente(cli)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </div>

      {/* Modal Formulario de Cliente Simplificado */}
      <Modal
        opened={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <IconUsers size={18} stroke={2} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                {clienteEnEdicion ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Información básica de contacto</p>
            </div>
          </div>
        }
        centered
        radius={24}
        size="md"
        classNames={{
          header: 'border-b border-slate-100 pb-3 pt-1 px-5',
          body: 'p-5',
          content: '!rounded-3xl shadow-2xl overflow-hidden border border-slate-100',
        }}
      >
        <div className="space-y-4">
          <TextInput
            label="Nombre Completo / Razón Social"
            placeholder="Ej. Comercializadora del Norte"
            value={formNombre}
            onChange={(e) => {
              setFormNombre(e.target.value);
              if (errorNombre) setErrorNombre('');
            }}
            error={errorNombre}
            radius="lg"
            required
            autoFocus
          />

          <TextInput
            label="Teléfono"
            placeholder="Ej. 55 1234 5678"
            leftSection={<IconPhone size={16} className="text-slate-400" />}
            value={formTelefono}
            onChange={(e) => setFormTelefono(e.target.value)}
            radius="lg"
          />

          <Group justify="flex-end" gap="sm" pt="xs" className="border-t border-slate-100">
            <Button variant="default" radius="xl" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button color="indigo" radius="xl" className="font-bold shadow-md shadow-indigo-500/15" onClick={guardarCliente}>
              Guardar Cliente
            </Button>
          </Group>
        </div>
      </Modal>

      {/* Modal de confirmacion con componentes UI */}
      <ModalConfirmacion
        abierto={Boolean(clienteAEliminar)}
        alCerrar={() => setClienteAEliminar(null)}
        alConfirmar={confirmarEliminarCliente}
        titulo="¿Eliminar cliente?"
        mensaje={`¿Estás seguro de eliminar a "${clienteAEliminar?.nombre}" del catálogo de clientes?`}
        textoConfirmar="Eliminar Cliente"
        color="red"
        icono={IconTrash}
      />
    </div>
  );
};
