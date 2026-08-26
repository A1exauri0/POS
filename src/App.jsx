import { useState } from 'react';
import { Encabezado } from './components/Encabezado';
import { BarraNavegacion } from './components/BarraNavegacion';
import { PantallaVentas } from './modules/ventas/PantallaVentas';
import { PantallaInventario } from './modules/inventario/PantallaInventario';
import { PantallaCaja } from './modules/caja/PantallaCaja';
import { PantallaReportes } from './modules/reportes/PantallaReportes';
import { PantallaConfiguracion } from './modules/configuracion/PantallaConfiguracion';

function App() {
  const [vistaActiva, setVistaActiva] = useState('ventas');

  const renderizarVista = () => {
    switch (vistaActiva) {
      case 'ventas':
        return <PantallaVentas />;
      case 'inventario':
        return <PantallaInventario />;
      case 'caja':
        return <PantallaCaja />;
      case 'reportes':
        return <PantallaReportes />;
      case 'configuracion':
        return <PantallaConfiguracion />;
      default:
        return <PantallaVentas />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* Barra Superior */}
      <Encabezado />

      {/* Cuerpo Principal con Sidebar y Vista Activa */}
      <div className="flex flex-1 overflow-hidden">
        <BarraNavegacion vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
        <div className="flex-1 flex overflow-hidden">{renderizarVista()}</div>
      </div>
    </div>
  );
}

export default App;
