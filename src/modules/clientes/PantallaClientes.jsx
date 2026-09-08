import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Button,
  TextInput,
  Badge,
  Modal,
  Group,
  ActionIcon,
  Tooltip,
  Pagination,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconUsers,
  IconPhone,
  IconLock,
  IconCheck,
} from '@tabler/icons-react';
import {
  obtenerClientes,
  cargarClientesBD,
  guardarClienteBD,
  eliminarClienteBD,
} from '../../services/clienteServicio';
import { useVenta } from '../../contexts/VentaContext';
import { formatearMoneda, formatearFechaHora } from '../../utils/formateadores';
import { notifications } from '@mantine/notifications';
import { ModalConfirmacion } from '../../components/ModalConfirmacion';

export const PantallaClientes = () => {
  const { historialVentas } = useVenta();
  const [clientes, setClientes] = useState(() => obtenerClientes());
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  // Cargar clientes desde SQLite al montar la vista
  useEffect(() => {
    cargarClientesBD().then(setClientes);
  }, []);

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

  const guardarCliente = async () => {
    const nombreLimpio = formNombre.trim();
    if (!nombreLimpio) {
      setErrorNombre('El nombre del cliente es obligatorio');
      return;
    }

    let clienteAGuardar;
    if (clienteEnEdicion) {
      clienteAGuardar = {
        ...clienteEnEdicion,
        nombre: nombreLimpio,
        telefono: formTelefono.trim() || 'Sin teléfono',
      };
    } else {
      clienteAGuardar = {
        id: `cli-${Date.now()}`,
        nombre: nombreLimpio,
        telefono: formTelefono.trim() || 'Sin teléfono',
        esPredeterminado: false,
      };
    }

    const listaActualizada = await guardarClienteBD(clienteAGuardar);
    setClientes(listaActualizada);
    setModalAbierto(false);

    notifications.show({
      title: clienteEnEdicion ? 'Cliente Actualizado' : 'Cliente Registrado',
      message: `El cliente "${nombreLimpio}" se ha guardado correctamente.`,
      color: 'teal',
      icon: <IconCheck size={18} />,
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

  const confirmarEliminarCliente = async () => {
    if (!clienteAEliminar) return;
    const listaActualizada = await eliminarClienteBD(clienteAEliminar.id);
    setClientes(listaActualizada);

    notifications.show({
      title: 'Cliente Eliminado',
      message: `El cliente "${clienteAEliminar.nombre}" fue retirado del sistema.`,
      color: 'red',
    });
    setClienteAEliminar(null);
  };

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  const filtrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return clientes;
    const normalizado = terminoBusqueda.trim().toLowerCase();

    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(normalizado) ||
        (c.telefono && c.telefono.includes(normalizado))
    );
  }, [clientes, terminoBusqueda]);

  // Reiniciar a la primera pagina al buscar
  useEffect(() => {
    setPaginaActual(1);
  }, [terminoBusqueda]);

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina) || 1;
  const clientesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return filtrados.slice(inicio, inicio + itemsPorPagina);
  }, [filtrados, paginaActual, itemsPorPagina]);

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

      {/* Tabla de Clientes con Paginacion */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Table highlightOnHover verticalSpacing="md" stickyHeader className="w-full">
            <Table.Thead className="bg-slate-50/80 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200/80">
              <Table.Tr>
                <Table.Th className="w-1/2">Cliente / Razón Social</Table.Th>
                <Table.Th className="w-1/4">Teléfono de Contacto</Table.Th>
                <Table.Th className="w-48">Tipo de Cliente</Table.Th>
                <Table.Th className="w-28 text-right">Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtrados.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} className="text-center py-16 text-slate-400 text-sm">
                    No se encontraron clientes registrados.
                  </Table.Td>
                </Table.Tr>
              ) : (
                clientesPaginados.map((cli) => {
                  const esDefault = cli.esPredeterminado || cli.id === 'cli-1';

                  // Calcular metricas de compras asociadas a este cliente
                  const compras = historialVentas.filter(
                    (v) =>
                      v.cliente?.id === cli.id ||
                      (esDefault && (!v.cliente?.id || v.cliente?.id === 'cli-1'))
                  );
                  const totalTickets = compras.length;

                  return (
                    <Table.Tr key={cli.id} className="text-sm text-slate-800 hover:bg-slate-50/80 transition-colors">
                      <Table.Td className="font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                              esDefault
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                            }`}
                          >
                            {cli.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 leading-tight truncate">
                              {cli.nombre}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono font-normal">
                              ID: {cli.id}
                            </span>
                          </div>
                        </div>
                      </Table.Td>

                      <Table.Td className="text-xs text-slate-600 font-mono">
                        <div className="flex items-center gap-1.5">
                          <IconPhone size={14} className="text-slate-400 shrink-0" />
                          <span>{cli.telefono || 'Sin teléfono'}</span>
                        </div>
                      </Table.Td>

                      <Table.Td>
                        {esDefault ? (
                          <Badge color="gray" size="sm" variant="filled" radius="sm">
                            Público General
                          </Badge>
                        ) : totalTickets >= 3 ? (
                          <Badge color="teal" size="sm" variant="light" radius="sm">
                            Cliente Frecuente
                          </Badge>
                        ) : (
                          <Badge color="indigo" size="sm" variant="light" radius="sm">
                            Nuevo
                          </Badge>
                        )}
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

        {/* Pie de Paginación */}
        {filtrados.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-slate-100 bg-white">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {(paginaActual - 1) * itemsPorPagina + 1} -{' '}
              {Math.min(paginaActual * itemsPorPagina, filtrados.length)} de {filtrados.length} clientes
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
