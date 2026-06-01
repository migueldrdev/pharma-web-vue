import type { IMenuItem } from '@/interfaces/IMenuItem';

export const defaultMenuItems: IMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/',
    permission: 'dashboard.view',
    description: 'Panel principal',
  },
  {
    id: 'sales',
    label: 'Ventas',
    icon: 'point_of_sale',
    permission: 'sales.view',
    defaultOpen: true,
    children: [
      { id: 'new-sale', label: 'Nueva Venta', icon: 'add_shopping_cart', route: '/sales/new', permission: 'sales.create' },
      { id: 'sales-list', label: 'Lista de Ventas', icon: 'receipt_long', route: '/sales', permission: 'sales.list' },
      { id: 'sales-reports', label: 'Reportes', icon: 'analytics', route: '/sales/reports', permission: 'sales.reports' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventario',
    icon: 'inventory',
    permission: 'inventory.view',
    children: [
      { id: 'products', label: 'Productos', icon: 'medication', route: '/inventory/products', permission: 'products.view', badge: 1234 },
      { id: 'categories', label: 'Categorías', icon: 'category', route: '/inventory/categories', permission: 'categories.view' },
      { id: 'stock-alerts', label: 'Alertas de Stock', icon: 'warning', route: '/inventory/alerts', permission: 'inventory.alerts', badge: 23, badgeColor: 'warning' },
      { id: 'expiry-alerts', label: 'Productos por Vencer', icon: 'event_busy', route: '/inventory/expiry', permission: 'inventory.expiry', badge: 8, badgeColor: 'negative' },
    ],
  },
  {
    id: 'purchases',
    label: 'Compras',
    icon: 'shopping_cart',
    permission: 'purchases.view',
    children: [
      { id: 'new-purchase', label: 'Nueva Compra', icon: 'add_circle', route: '/purchases/new', permission: 'purchases.create' },
      { id: 'purchases-list', label: 'Lista de Compras', icon: 'list_alt', route: '/purchases', permission: 'purchases.list' },
      { id: 'suppliers', label: 'Proveedores', icon: 'business', route: '/purchases/suppliers', permission: 'suppliers.view' },
    ],
  },
  {
    id: 'customers',
    label: 'Clientes',
    icon: 'people',
    route: '/customers',
    permission: 'customers.view',
    description: 'Gestión de clientes',
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: 'assessment',
    permission: 'reports.view',
    children: [
      { id: 'sales-report', label: 'Reporte de Ventas', icon: 'trending_up', route: '/reports/sales', permission: 'reports.sales' },
      { id: 'inventory-report', label: 'Reporte de Inventario', icon: 'inventory_2', route: '/reports/inventory', permission: 'reports.inventory' },
      { id: 'financial-report', label: 'Reporte Financiero', icon: 'account_balance', route: '/reports/financial', permission: 'reports.financial' },
    ],
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: 'settings',
    permission: 'settings.view',
    children: [
      { id: 'general-settings', label: 'General', icon: 'tune', route: '/settings/general', permission: 'settings.general' },
      { id: 'users', label: 'Usuarios', icon: 'manage_accounts', route: '/settings/users', permission: 'users.view' },
      { id: 'permissions', label: 'Permisos', icon: 'security', route: '/settings/permissions', permission: 'permissions.view' },
      { id: 'backup', label: 'Respaldo', icon: 'backup', route: '/settings/backup', permission: 'backup.view' },
    ],
  },
];

import type { ILayoutNotification, ILayoutUser } from '../interfaces/ILayout';

export const defaultNotifications: ILayoutNotification[] = [
  { id: '1', title: 'Stock Bajo', message: 'Paracetamol 500mg tiene solo 5 unidades', icon: 'warning', color: 'warning', time: 'Hace 5 min', read: false },
  { id: '2', title: 'Nueva Venta', message: 'Venta completada por S/ 125.50', icon: 'point_of_sale', color: 'positive', time: 'Hace 15 min', read: false },
  { id: '3', title: 'Producto Vencido', message: 'Revisar lote ABC123 de Amoxicilina', icon: 'event_busy', color: 'negative', time: 'Hace 1 hora', read: true },
];

export const defaultUser: ILayoutUser = {
  id: '1',
  name: 'Dr. María González',
  email: 'maria.gonzalez@pharmacare.com',
  role: 'Administrador',
  avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
};
