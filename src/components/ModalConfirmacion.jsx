import { Modal, Button, Group, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export const ModalConfirmacion = ({
  abierto,
  alCerrar,
  alConfirmar,
  titulo = '¿Estás seguro?',
  mensaje = 'Esta acción no se puede deshacer.',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  color = 'red',
  icono: Icono = IconAlertTriangle,
}) => {
  return (
    <Modal
      opened={abierto}
      onClose={alCerrar}
      centered
      radius="lg"
      size="sm"
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Icono de Alerta / Peligro */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
            color === 'red'
              ? 'bg-rose-100 text-rose-600'
              : color === 'orange'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          <Icono size={28} stroke={2} />
        </div>

        {/* Titulo y Mensaje */}
        <h3 className="text-base font-bold text-slate-800 mb-1">{titulo}</h3>
        <Text size="sm" c="dimmed" className="leading-relaxed mb-5">
          {mensaje}
        </Text>

        {/* Botones de Accion */}
        <Group justify="center" gap="sm" className="w-full">
          <Button
            variant="default"
            radius="md"
            onClick={alCerrar}
            className="flex-1"
          >
            {textoCancelar}
          </Button>
          <Button
            color={color}
            radius="md"
            onClick={() => {
              alConfirmar();
              alCerrar();
            }}
            className="flex-1"
          >
            {textoConfirmar}
          </Button>
        </Group>
      </div>
    </Modal>
  );
};
