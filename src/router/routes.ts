import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  // Ruta de login (sin layout)
  {
    path: '/login',
    name: 'login',
    component: () => import('@pages/Login/Login.vue'),
    meta: {
      requiresAuth: false,
      title: 'Iniciar Sesión',
    },
  },

  // Rutas principales (con layout)
  {
    path: '/',
    component: () => import('@layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      // Dashboard
      {
        path: '',
        name: 'dashboard',
        component: () => import('@pages/Dashboard/Dashboard.vue'),
        meta: {
          permission: 'dashboard.view',
          title: 'Dashboard',
          breadcrumb: 'Dashboard',
        },
      },

      // Ventas
      {
        path: '/sales',
        name: 'sales',
        component: () => import('@pages/Sales/Index.vue'),
        meta: {
          permission: 'sales.list',
          title: 'Lista de Ventas',
          breadcrumb: 'Ventas',
        },
      },
      {
        path: '/sales/new',
        name: 'new-sale',
        component: () => import('@pages/Sales/New.vue'),
        meta: {
          permission: 'sales.create',
          title: 'Nueva Venta',
          breadcrumb: 'Nueva Venta',
        },
      },
      {
        path: '/sales/reports',
        name: 'sales-reports',
        component: () => import('@pages/Sales/Reports.vue'),
        meta: {
          permission: 'sales.reports',
          title: 'Reportes de Ventas',
          breadcrumb: 'Reportes',
        },
      },

      // Inventario
      {
        path: '/inventory/products',
        name: 'products',
        component: () => import('@pages/Inventory/Products/Index.vue'),
        meta: {
          permission: 'products.view',
          title: 'Productos',
          breadcrumb: 'Productos',
        },
      },
      {
        path: '/inventory/categories',
        name: 'categories',
        component: () => import('@pages/Inventory/Categories/Index.vue'),
        meta: {
          permission: 'categories.view',
          title: 'Categorías',
          breadcrumb: 'Categorías',
        },
      },
      {
        path: '/inventory/alerts',
        name: 'stock-alerts',
        component: () => import('@pages/Inventory/StockAlerts.vue'),
        meta: {
          permission: 'inventory.alerts',
          title: 'Alertas de Stock',
          breadcrumb: 'Alertas de Stock',
        },
      },
      {
        path: '/inventory/expiry',
        name: 'expiry-alerts',
        component: () => import('@pages/Inventory/ExpiryAlerts.vue'),
        meta: {
          permission: 'inventory.expiry',
          title: 'Productos por Vencer',
          breadcrumb: 'Por Vencer',
        },
      },

      // Compras
      {
        path: '/purchases',
        name: 'purchases',
        component: () => import('@pages/Purchases/Index.vue'),
        meta: {
          permission: 'purchases.list',
          title: 'Lista de Compras',
          breadcrumb: 'Compras',
        },
      },
      {
        path: '/purchases/new',
        name: 'new-purchase',
        component: () => import('@pages/Purchases/New.vue'),
        meta: {
          permission: 'purchases.create',
          title: 'Nueva Compra',
          breadcrumb: 'Nueva Compra',
        },
      },
      {
        path: '/purchases/suppliers',
        name: 'suppliers',
        component: () => import('@pages/Purchases/Suppliers/Index.vue'),
        meta: {
          permission: 'suppliers.view',
          title: 'Proveedores',
          breadcrumb: 'Proveedores',
        },
      },

      // Clientes
      {
        path: '/customers',
        name: 'customers',
        component: () => import('@pages/Customers/Index.vue'),
        meta: {
          permission: 'customers.view',
          title: 'Clientes',
          breadcrumb: 'Clientes',
        },
      },

      // Reportes
      {
        path: '/reports/sales',
        name: 'sales-report',
        component: () => import('@pages/Reports/Sales.vue'),
        meta: {
          permission: 'reports.sales',
          title: 'Reporte de Ventas',
          breadcrumb: 'Reporte de Ventas',
        },
      },
      {
        path: '/reports/inventory',
        name: 'inventory-report',
        component: () => import('@pages/Reports/Inventory.vue'),
        meta: {
          permission: 'reports.inventory',
          title: 'Reporte de Inventario',
          breadcrumb: 'Reporte de Inventario',
        },
      },
      {
        path: '/reports/financial',
        name: 'financial-report',
        component: () => import('@pages/Reports/Financial.vue'),
        meta: {
          permission: 'reports.financial',
          title: 'Reporte Financiero',
          breadcrumb: 'Reporte Financiero',
        },
      },

      // Configuración
      {
        path: '/settings',
        name: 'settings',
        component: () => import('@pages/Settings/Index.vue'),
        meta: {
          requiresAuth: true,
          permission: 'settings.view',
          title: 'Configuración',
          breadcrumb: 'Configuración',
        },
      },
      {
        path: '/settings/general',
        name: 'general-settings',
        component: () => import('@pages/Settings/General.vue'),
        meta: {
          permission: 'settings.general',
          title: 'Configuración General',
          breadcrumb: 'General',
        },
      },
      {
        path: '/settings/users',
        name: 'users',
        component: () => import('@pages/Settings/Users/Index.vue'),
        meta: {
          permission: 'users.view',
          title: 'Usuarios',
          breadcrumb: 'Usuarios',
        },
      },
      {
        path: '/settings/permissions',
        name: 'permissions',
        component: () => import('@pages/Settings/Permissions/Index.vue'),
        meta: {
          permission: 'permissions.view',
          title: 'Permisos',
          breadcrumb: 'Permisos',
        },
      },
      {
        path: '/settings/backup',
        name: 'backup',
        component: () => import('@pages/Settings/Backup/Index.vue'),
        meta: {
          permission: 'backup.view',
          title: 'Respaldo',
          breadcrumb: 'Respaldo',
        },
      },

      // Páginas de perfil y utilidades
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@pages/Profile.vue'),
        meta: {
          title: 'Mi Perfil',
          breadcrumb: 'Perfil',
        },
      },
      {
        path: '/change-password',
        name: 'change-password',
        component: () => import('@pages/ChangePassword.vue'),
        meta: {
          title: 'Cambiar Contraseña',
          breadcrumb: 'Cambiar Contraseña',
        },
      },
      {
        path: '/help',
        name: 'help',
        component: () => import('@pages/Help.vue'),
        meta: {
          title: 'Ayuda',
          breadcrumb: 'Ayuda',
        },
      },
    ],
  },

  // Ruta 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@pages/ErrorNotFound.vue'),
    meta: {
      title: 'Página no encontrada',
    },
  },
];

// Función para obtener el título de la página
export const getPageTitle = (routeName: string): string => {
  const route = routes
    .flatMap((r) => (r.children ? [r, ...r.children] : [r]))
    .find((r) => r.name === routeName);

  return (route?.meta?.title as string) || 'PharmaCare';
};
