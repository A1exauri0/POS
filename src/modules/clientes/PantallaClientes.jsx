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

export const PantallaClientes = () => {
  const [clientes, setClientes] = useState(() => obtenerClientes());
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);

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

  const eliminarCliente = (cli) => {
    if (cli.esPredeterminado || cli.id === 'cli-1') {
      alert('El cliente "Público General" es el cliente predeterminado del sistema y no puede eliminarse.');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar a "${cli.nombre}" del catálogo?`)) {
      const listaActualizada = clientes.filter((c) => c.id !== cli.id);
      setClientes(listaActualizada);
      guardarClientes(listaActualizada);

      notifications.show({
        title: 'Cliente Eliminado',
        message: `El cliente "${cli.nombre}" fue retirado del sistema.`,
        color: 'red',
      });
    }
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
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-3.5 overflow-hidden">
      {/* Encabezado del modulo */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <IconUsers size={24} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-tight">
              Catálogo de Clientes
            </h2>
            <p className="text-xs text-slate-500">
              {clientes.length} clientes registrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TextInput
            placeholder="Buscar por nombre o teléfono..."
            leftSection={<IconSearch size={16} />}
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            size="sm"
            className="w-72"
          />

          <Button
            color="indigo"
            leftSection={<IconPlus size={18} />}
            onClick={abrirModalNuevo}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Tabla de Clientes Simplificada */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-y-auto">
        <Table highlightOnHover verticalSpacing="sm" stickyHeader>
          <Table.Thead className="bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Table.Tr>
              <Table.Th>Nombre / Razón Social</Table.Th>
              <Table.Th>Teléfono</Table.Th>
              <Table.Th className="text-right">Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtrados.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3} className="text-center py-8 text-slate-400 text-sm">
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
                          <Badge color="dark" size="xs" variant="filled">
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
                            onClick={() => abrirModalEditar(cli)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>

                        {esDefault ? (
                          <Tooltip label="Cliente predeterminado (No eliminable)">
                            <ActionIcon variant="subtle" color="gray" disabled>
                              <IconLock size={16} />
                            </ActionIcon>
                          </Tooltip>
                        ) : (
                          <Tooltip label="Eliminar cliente">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => eliminarCliente(cli)}
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
          <span className="font-bold text-slate-800">
            {clienteEnEdicion ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
          </span>
        }
        centered
        radius="lg"
      >
        <div className="space-y-3.5 pt-1">
          <TextInput
            label="Nombre Completo / Razón Social"
            placeholder="Ej. Comercializadora del Norte"
            value={formNombre}
            onChange={(e) => {
              setFormNombre(e.target.value);
              if (errorNombre) setErrorNombre('');
            }}
            error={errorNombre}
            required
            autoFocus
          />

          <TextInput
            label="Teléfono"
            placeholder="Ej. 55 1234 5678"
            leftSection={<IconPhone size={16} className="text-slate-400" />}
            value={formTelefono}
            onChange={(e) => setFormTelefono(e.target.value)}
          />

          <Group justify="flex-end" pt="sm">
            <Button variant="default" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button color="indigo" onClick={guardarCliente}>
              Guardar Cliente
            </Button>
          </Group>
        </div>
      </Modal>
    </div>
  );
};
