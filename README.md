# Punto de Venta Local (POS)

Sistema de Punto de Venta de mostrador rápido, ligero y diseñado para operar de forma local o en red de área local (LAN). Construido con **React 19**, **Vite**, **Mantine UI**, **TailwindCSS** y **Tauri v2**.

---

## Comandos Principales

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo web
pnpm dev

# Iniciar la aplicación de escritorio nativa (Tauri)
pnpm tauri dev

# Compilar bundle de producción web
pnpm build

# Compilar instalador ejecutable de escritorio
pnpm tauri build
```

---

## ¿Cómo se generaron los iconos de escritorio?

Tauri incluye una herramienta oficial en su CLI (`@tauri-apps/cli`) que genera automáticamente todos los tamaños y formatos necesarios para Windows (`.ico`), macOS (`.icns`), Linux y móviles a partir de una sola imagen cuadrada:

```bash
pnpm tauri icon public/images/logo.png
```

Este comando procesa la imagen y actualiza automáticamente los archivos dentro de la carpeta `src-tauri/icons/`:
* `icon.ico`: Icono ejecutable y de la barra de tareas en Windows.
* `icon.icns`: Icono para aplicaciones en macOS.
* `32x32.png`, `128x128.png`, `icon.png`: Iconos para ventanas y sistemas Linux.
* Logotipos en mosaico para la tienda de Windows (Square150x150, etc.).

> **Nota:** Al compilar o reiniciar con `pnpm tauri dev`, Tauri enlaza el archivo `icon.ico` directamente en el ejecutable nativo.

---

## Estructura del Proyecto

* **`src/modules/`**:
  * `ventas/`: Catálogo interactivo de productos, buscador con código de barras y panel de ticket.
  * `inventario/`: CRUD de productos con carga de imágenes y gestión de categorías.
  * `clientes/`: Registro y selección rápida de clientes.
  * `caja/`: Apertura/cierre de turnos, arqueo y entradas/salidas de efectivo.
  * `reportes/`: Historial de ventas, tickets emitidos y desglose financiero.
  * `configuracion/`: Datos fiscales del negocio, IVA y opciones de impresión.
* **`src/data/`**: Semillas iniciales en archivos `.json` (productos, categorías, configuración). Se sincronizan automáticamente con `localStorage` al detectar cambios en los archivos.
* **`src-tauri/`**: Configuración (`tauri.conf.json`), iconos e infraestructura Rust para la app de escritorio.
