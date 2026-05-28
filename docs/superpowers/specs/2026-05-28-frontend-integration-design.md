# Diseño de Integración Frontend-Backend — PharmaWeb

## 1. Visión General

**PharmaWeb** es el frontend SPA que consume la API de **FarmaERP** (Laravel 12). La integración transforma el frontend actual —mayormente stubs y estáticos— en una aplicación profesional, responsive y preparada para desplegarse como **Web (SPA/PWA), Desktop (Electron) y Móvil (Capacitor)** desde el mismo código base.

### Stack
| Capa | Tecnología |
|------|-----------|
| Framework UI | Quasar 2.16 (componentes nativos, grid, plugins) |
| Framework JS | Vue 3.4 (Composition API, `<script setup lang="ts">`) |
| State | Pinia 3 (setup stores) |
| HTTP | Axios + `useFetchHttp` composable |
| Router | Vue Router 4 (history mode) |
| Gráficos | Highcharts 12 + highcharts-vue |
| Build | Vite 6 + Quasar App-Vite |
| Tipado | TypeScript 5.5 (strict) |

---

## 2. Arquitectura de Carpetas Objetivo

```
src/
├── api/                          # Capa de servicios API (nueva)
│   ├── ApiService.ts             # Clase genérica CRUD + fetchHttp
│   ├── resources.ts              # Definiciones de endpoints (unificado)
│   └── modules/                  # Servicios por módulo
│       ├── productService.ts
│       ├── saleService.ts
│       ├── purchaseService.ts
│       └── ...
├── components/
│   ├── shared/                   # Componentes reutilizables (nuevo)
│   │   ├── AppPageHeader.vue     # Header con título, breadcrumb, acciones
│   │   ├── AppDataTable.vue      # Tabla con filtros, paginación, slots
│   │   ├── AppFormDialog.vue     # Diálogo maximizado con formulario
│   │   ├── AppKpiCard.vue        # Card de KPI
│   │   ├── AppConfirmDialog.vue  # Confirmación de acciones
│   │   └── AppStatusChip.vue     # Chip de estado (activo, inactivo, etc.)
│   └── EssentialLink.vue         # (legacy, eliminar)
├── composables/
│   ├── useApi.ts                 # Composable API (nuevo, centraliza fetchHttp)
│   ├── useCombo.ts               # (existente, refinar)
│   ├── usePagination.ts          # Paginación con Quasar (nuevo)
│   ├── useForm.ts                # Manejo de formularios (nuevo)
│   └── useLoading.ts             # (existente)
├── interfaces/                   # Tipos centralizados (refactorizado)
│   ├── IMenuItem.ts              # Unificado (antes duplicado 3x)
│   ├── IComboItem.ts             # (existente)
│   ├── IProduct.ts               # Interfaz completa de producto
│   ├── ISale.ts                  # Interfaz de venta
│   ├── IPurchase.ts              # Interfaz de compra
│   ├── IClient.ts
│   ├── ISupplier.ts
│   ├── IKpi.ts
│   └── IApiResponse.ts           # Respuesta genérica de API
├── layouts/
│   └── MainLayout.vue            # (refactorizado: consume store, no hardcodea)
├── pages/
│   ├── Dashboard/                # (refactorizar con datos reales)
│   ├── Inventory/Products/       # (refinar con componentes shared)
│   ├── Sales/                    # (implementar)
│   ├── Purchases/                # (implementar)
│   ├── Customers/                # (implementar)
│   └── ...
├── stores/
│   ├── auth.ts                   # Auth store (unificado)
│   ├── menu.ts                   # Menu store (único, sin duplicar)
│   ├── permissions.ts            # Permissions (conectar a API)
│   └── combos/
│       └── comboStore.ts         # (existente)
├── boot/
│   └── axios.ts                  # (corregido: usa VITE_API_BASE_URL)
└── css/
    ├── app.scss                  # Global utilities (nuevo contenido)
    └── quasar.variables.scss     # Paleta unificada
```

---

## 3. Estándares de Código

### 3.1 TypeScript
- `strict: true` — sin excepciones
- Interfaces exportadas desde `src/interfaces/` (no definiciones inline en SFC)
- `ref<T>(...)` siempre tipado
- No usar `any`; preferir `unknown` o genéricos

### 3.2 Vue 3 + Quasar
- `q-col`/`q-row` como sistema de grid (NO CSS Grid nativo)
- `$q.screen` para lógica responsive (NO media queries manuales)
- Componentes Quasar nativos: `q-table`, `q-card`, `q-dialog`, `q-form`
- `defineProps<T>()` y `defineEmits<T>()` con tipos
- Slots nombrados para personalización de componentes compartidos

### 3.3 Pinia
- Setup stores (`defineStore('name', () => { ... })`)
- `storeToRefs()` para desestructurar reactividad
- No mutar estado fuera del store
- Acciones async con try/catch y estados de carga

### 3.4 API
- Capa de servicios (`src/api/modules/*Service.ts`) — no llamadas directas desde componentes
- `useApi()` composable como punto único de acceso HTTP
- `IHttpResponse<T>` como tipo de retorno estándar
- Manejo de errores centralizado con `Notify`

---

## 4. Paleta de Colores Unificada

```scss
// Variables Quasar (sobreescritas para tema farmacéutico)
$primary   : #00b4a6;  // Verde médico (era $primary-color)
$secondary : #26a69a;
$accent    : #ff9500;  // Naranja alerta
$dark      : #1d1d1d;
$positive  : #21ba45;
$negative  : #c10015;
$info      : #31ccec;
$warning   : #f2c037;
```

**Regla:** Quasar `$primary` = verde farmacéutico. Eliminar variable `$primary-color` duplicada. Todo componente Quasar hereda automáticamente.

---

## 5. Fases de Implementación

### Fase 0 — Fundación (obligatoria antes de cualquier módulo)

| ID | Tarea | Prioridad |
|----|-------|-----------|
| 0.1 | Usar `VITE_API_BASE_URL` del `.env` en `boot/axios.ts` | CRÍTICO |
| 0.2 | Unificar router (eliminar wrapper Quasar duplicado) | CRÍTICO |
| 0.3 | Unificar token storage (`localStorage`, clave `token`) | CRÍTICO |
| 0.4 | Unificar interfaz `MenuItem` en `src/interfaces/IMenuItem.ts` | ALTO |
| 0.5 | Refactorizar `MainLayout.vue` (consumir store, no hardcodear menú) | ALTO |
| 0.6 | Unificar paleta (Quasar `$primary` = verde) y eliminar variable duplicada | ALTO |
| 0.7 | Crear componentes compartidos base (`AppPageHeader`, `AppDataTable`, `AppFormDialog`, `AppConfirmDialog`) | ALTO |
| 0.8 | Crear capa de servicios API (`src/api/ApiService.ts` + módulos) | ALTO |
| 0.9 | Crear composables nuevos (`useApi`, `usePagination`, `useForm`) | MEDIO |
| 0.10 | Centralizar interfaces en `src/interfaces/` | MEDIO |
| 0.11 | Escribir `app.scss` global con utilidades | BAJO |

### Fase 1 — Productos (refinar existente)

| ID | Tarea |
|----|-------|
| 1.1 | Migrar `Products/Index.vue` a `AppDataTable` + `AppPageHeader` |
| 1.2 | Migrar `Products/Form.vue` a `AppFormDialog` |
| 1.3 | Conectar imagen con URL corregida de MinIO |
| 1.4 | Eliminar código mock/simulado |
| 1.5 | Asegurar responsive con `q-col`/`q-row` + `$q.screen` |

### Fase 2 — Ventas

| ID | Tarea |
|----|-------|
| 2.1 | `AppPageHeader` + `AppDataTable` para lista de ventas |
| 2.2 | `AppFormDialog` para crear venta (cliente + productos + cantidades) |
| 2.3 | Validación de stock insuficiente (error desde backend → Notify) |
| 2.4 | Trazabilidad FIFO visible en detalle de venta |
| 2.5 | `useCombo` para clientes y productos en formulario |

### Fase 3 — Compras + Proveedores

| ID | Tarea |
|----|-------|
| 3.1 | CRUD Proveedores con componentes shared |
| 3.2 | `AppDataTable` para lista de compras |
| 3.3 | `AppFormDialog` para crear compra (proveedor + productos + lotes) |
| 3.4 | Campos de lote (`batch_number`, `expiration_date`) en formulario |
| 3.5 | Conexión con creación automática de lotes del backend |

### Fase 4-7 — Siguientes módulos

| Fase | Módulo | Páginas |
|------|--------|---------|
| 4 | Inventario | Categorías, Alertas de Stock, Vencimientos |
| 5 | Clientes | CRUD Clientes |
| 6 | Dashboard | KPIs reales, gráficos dinámicos |
| 7 | Reportes + Config | Ventas, Inventario, Usuarios, Permisos |

---

## 6. Preparación Cross-Platform (Reglas desde Fase 0)

| Regla | Implementación |
|-------|---------------|
| Grid | `q-col`/`q-row` con breakpoints (`col-sm-6 col-md-4 col-lg-3`) |
| Navegación | `q-drawer` con `behavior="mobile"` en resoluciones pequeñas |
| Formularios | `q-form` con `stacked` label en mobile, `outlined` en desktop |
| Tablas | `q-table` con `dense` en mobile, columnas ocultas con `v-if="$q.screen.gt.xs"` |
| Diálogos | `maximized` toggle según `$q.screen.lt.md` |
| Touch | `q-btn` con `size="md"` mínimo, sin hover-dependencia |
| Platform | `$q.platform.is.mobile`, `$q.platform.is.electron` para condicionales |

---

## 7. Testing (Futuro)

| Tipo | Herramienta | Cuándo |
|------|------------|--------|
| Unit (componentes) | Vitest + Vue Test Utils | Post-Fase 3 |
| e2e (flujos) | Puppeteer MCP | Post-Fase 3 |
| Visual (responsive) | Puppeteer screenshots | Post-Fase 3 |

---

## 8. Notas para Desarrolladores

- **Nunca** definir tipos inline en SFC; siempre en `src/interfaces/`
- **Nunca** hardcodear URLs; usar `VITE_API_BASE_URL` del `.env`
- **Nunca** usar CSS Grid nativo; usar `q-col`/`q-row` de Quasar
- **Nunca** usar media queries manuales; usar `$q.screen` de Quasar
- **Siempre** usar componentes shared en vez de repetir markup
- **Siempre** pasar por `src/api/modules/*Service.ts` para llamadas HTTP
- **Siempre** manejar estados: loading, empty, error, success
