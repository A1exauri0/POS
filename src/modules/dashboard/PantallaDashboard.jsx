import { useState, useMemo } from 'react';
import { Button, Badge } from '@mantine/core';
import { AreaChart, DonutChart } from '@mantine/charts';
import {
  IconLayoutDashboard,
  IconShoppingCart,
  IconReceipt,
  IconTrendingUp,
  IconPackage,
  IconChartPie,
  IconCalendar,
} from '@tabler/icons-react';
import { useVenta } from '../../contexts/VentaContext';
import { formatearMoneda, formatearFechaHora } from '../../utils/formateadores';

// Paleta con los colores solicitados: azul, amarillo, rojo, verde, morado, naranja
const COLORES_MANTINE = ['blue.6', 'yellow.5', 'red.6', 'teal.6', 'grape.6', 'orange.6'];
const MAPA_COLORES_HEX = {
  'blue.6': '#2563eb',
  'yellow.5': '#eab308',
  'red.6': '#dc2626',
  'teal.6': '#0d9488',
  'grape.6': '#9333ea',
  'orange.6': '#ea580c',
};

export const PantallaDashboard = ({ alNavegar }) => {
  const { historialVentas } = useVenta();
  const [periodoGrafica, setPeriodoGrafica] = useState('30dias'); // '30dias' | 'mes' | '7dias'

  // 1. Calculo de metricas y datos formateados para las graficas
  const metricas = useMemo(() => {
    const totalVendido = historialVentas.reduce((sum, v) => sum + (v.totales?.total || 0), 0);
    const totalTickets = historialVentas.length;
    const totalArticulos = historialVentas.reduce((sum, v) => sum + (v.totales?.totalArticulos || 0), 0);

    // Conteo para DonutChart de Productos mas vendidos
    const conteoProductos = {};
    historialVentas.forEach((v) => {
      (v.articulos || []).forEach((art) => {
        if (!conteoProductos[art.id]) {
          conteoProductos[art.id] = {
            name: art.nombre,
            value: 0,
            ingresos: 0,
          };
        }
        conteoProductos[art.id].value += art.cantidad;
        conteoProductos[art.id].ingresos += art.subtotal;
      });
    });

    const datosDonut = Object.values(conteoProductos)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((item, index) => ({
        name: item.name,
        value: item.value,
        color: COLORES_MANTINE[index % COLORES_MANTINE.length],
      }));

    // Datos para la grafica de ventas por fecha
    const hoy = new Date();
    const datosLinea = [];

    if (periodoGrafica === 'mes') {
      // Determinar el mes a mostrar: mes actual o mes de las ultimas ventas
      let añoRef = hoy.getFullYear();
      let mesRef = hoy.getMonth();

      // Si en el mes actual no hay ventas pero si hay historial, usar el mes con mas ventas recientes
      const tieneVentasMesActual = historialVentas.some((v) => {
        if (!v.fecha) return false;
        const f = new Date(v.fecha);
        return f.getFullYear() === añoRef && f.getMonth() === mesRef;
      });

      if (!tieneVentasMesActual && historialVentas.length > 0) {
        const fechasOrdenadas = [...historialVentas]
          .filter((v) => v.fecha)
          .map((v) => new Date(v.fecha))
          .sort((a, b) => b - a);

        if (fechasOrdenadas.length > 0) {
          añoRef = fechasOrdenadas[0].getFullYear();
          mesRef = fechasOrdenadas[0].getMonth();
        }
      }

      const totalDiasMes = new Date(añoRef, mesRef + 1, 0).getDate();
      const nombreMesCorto = new Date(añoRef, mesRef, 1).toLocaleDateString('es-MX', { month: 'short' });

      for (let dia = 1; dia <= totalDiasMes; dia++) {
        const strDia = dia < 10 ? `0${dia}` : `${dia}`;
        const strMes = mesRef + 1 < 10 ? `0${mesRef + 1}` : `${mesRef + 1}`;
        const prefijoFecha = `${añoRef}-${strMes}-${strDia}`;

        const totalDia = historialVentas.reduce((sum, v) => {
          if (v.fecha && v.fecha.startsWith(prefijoFecha)) {
            return sum + (v.totales?.total || 0);
          }
          return sum;
        }, 0);

        datosLinea.push({
          date: `${dia} ${nombreMesCorto}`,
          Ventas: Math.round(totalDia),
        });
      }
    } else {
      // Periodo de dias correlativos (30 dias o 7 dias)
      const cantidadDias = periodoGrafica === '7dias' ? 7 : 30;

      for (let i = cantidadDias - 1; i >= 0; i--) {
        const fechaDia = new Date(hoy);
        fechaDia.setDate(hoy.getDate() - i);

        const yyyy = fechaDia.getFullYear();
        const mm = String(fechaDia.getMonth() + 1).padStart(2, '0');
        const dd = String(fechaDia.getDate()).padStart(2, '0');
        const prefijoFecha = `${yyyy}-${mm}-${dd}`;

        const etiquetaFecha = fechaDia.toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'short',
        });

        const totalDia = historialVentas.reduce((sum, v) => {
          if (v.fecha && v.fecha.startsWith(prefijoFecha)) {
            return sum + (v.totales?.total || 0);
          }
          return sum;
        }, 0);

        datosLinea.push({
          date: etiquetaFecha,
          Ventas: Math.round(totalDia),
        });
      }
    }

    return {
      totalVendido,
      totalTickets,
      totalArticulos,
      datosDonut,
      datosLinea,
    };
  }, [historialVentas, periodoGrafica]);

  // Ultimas 5 ventas
  const ventasRecientes = useMemo(() => {
    return [...historialVentas].reverse().slice(0, 5);
  }, [historialVentas]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 p-4 gap-4 overflow-y-auto select-none">
      {/* Cabecera del Dashboard */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <IconLayoutDashboard size={22} stroke={2} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
              Panel Principal
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Resumen visual y rendimiento de ventas
            </p>
          </div>
        </div>

        {alNavegar && (
          <Button
            color="indigo"
            radius="xl"
            size="sm"
            leftSection={<IconShoppingCart size={16} />}
            onClick={() => alNavegar('ventas')}
            className="font-bold shadow-md shadow-indigo-500/15"
          >
            Ir a Cobrar
          </Button>
        )}
      </div>

      {/* 3 Tarjetas Basicas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Vendido */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Total Vendido
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <IconTrendingUp size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 font-mono mt-2 tracking-tight">
            {formatearMoneda(metricas.totalVendido)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Dinero total recaudado
          </p>
        </div>

        {/* Ventas Realizadas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Ventas Realizadas
            </span>
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
              <IconReceipt size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-600 font-mono mt-2 tracking-tight">
            {metricas.totalTickets}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Tickets cobrados
          </p>
        </div>

        {/* Productos Despachados */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Productos Despachados
            </span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
              <IconPackage size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600 font-mono mt-2 tracking-tight">
            {metricas.totalArticulos} <span className="text-xs font-normal text-slate-400">pzas</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Piezas físicas entregadas
          </p>
        </div>
      </div>

      {/* GRAFICA 1: AREACHART CON GRADIENTE Y SELECTOR DE PERIODO */}
      <div className="w-full bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <IconTrendingUp size={18} className="text-indigo-600" />
              Tendencia de Ingresos
            </h3>
            <p className="text-xs text-slate-400 font-medium">Ingresos diarios registrados en el periodo seleccionado</p>
          </div>

          {/* Selector de periodo */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPeriodoGrafica('30dias')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                periodoGrafica === '30dias'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Últimos 30 días
            </button>
            <button
              type="button"
              onClick={() => setPeriodoGrafica('mes')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                periodoGrafica === 'mes'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mes Completo
            </button>
            <button
              type="button"
              onClick={() => setPeriodoGrafica('7dias')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                periodoGrafica === '7dias'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              7 Días
            </button>
          </div>
        </div>

        <div className="pt-2">
          <AreaChart
            h={320}
            data={metricas.datosLinea}
            dataKey="date"
            series={[{ name: 'Ventas', color: 'indigo.6', label: 'Ventas ($)' }]}
            curveType="monotone"
            type="default"
            withGradient
            withDots
            strokeWidth={2.5}
            fillOpacity={0.15}
            dotProps={{ r: 3, strokeWidth: 1 }}
            activeDotProps={{ r: 5, strokeWidth: 2 }}
            valueFormatter={(valor) => formatearMoneda(valor)}
            tickLine="y"
            gridAxis="xy"
            yAxisProps={{ domain: [0, 'auto'], allowDecimals: false }}
          />
        </div>
      </div>

      {/* SECCIÓN INFERIOR: DONUT CHART DE PRODUCTOS Y ÚLTIMOS COBROS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* GRAFICA 2: DONUTCHART DE MANTINE PARA PRODUCTOS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <IconChartPie size={18} className="text-indigo-600" /> Productos Más Vendidos
            </h3>
            <span className="text-xs text-slate-400 font-medium">Top rotación</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-4">
            <div className="shrink-0">
              <DonutChart
                paddingAngle={10}
                data={metricas.datosDonut}
                size={180}
                thickness={24}
                withTooltip
                tooltipDataSource="segment"
                valueFormatter={(val) => `${val} pzas`}
              />
            </div>

            {/* Leyenda de los productos con colores asignados */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {metricas.datosDonut.map((prod) => (
                <div key={prod.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: MAPA_COLORES_HEX[prod.color] || '#2563eb',
                      }}
                    />
                    <span className="font-semibold text-slate-700 truncate" title={prod.name}>
                      {prod.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {prod.value} pzas
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-2">
            Distribución de piezas vendidas en mostrador
          </p>
        </div>

        {/* ÚLTIMOS COBROS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <IconReceipt size={18} className="text-slate-500" /> Últimos Cobros
            </h3>
            <span className="text-xs text-slate-400 font-medium">Recientes</span>
          </div>

          <div className="divide-y divide-slate-100 my-2">
            {ventasRecientes.map((v) => (
              <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600">{v.id}</span>
                    <Badge
                      size="xs"
                      radius="sm"
                      variant="light"
                      color={
                        v.pago?.metodo === 'efectivo'
                          ? 'teal'
                          : v.pago?.metodo === 'tarjeta'
                          ? 'blue'
                          : 'purple'
                      }
                    >
                      {v.pago?.metodo?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                    {v.cliente?.nombre || 'Público General'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono font-black text-slate-900 text-sm">
                    {formatearMoneda(v.totales?.total || 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatearFechaHora(v.fecha)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {alNavegar && (
            <Button
              variant="subtle"
              color="indigo"
              size="xs"
              radius="xl"
              onClick={() => alNavegar('reportes')}
              className="w-full text-xs font-semibold"
            >
              Ver Historial Completo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
