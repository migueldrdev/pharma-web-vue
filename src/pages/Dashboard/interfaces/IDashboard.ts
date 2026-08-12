/** Estructura de respuesta del endpoint /api/dashboard */
export interface IDashboardResponse {
  kpis: IDashboardKpis;
  charts: IDashboardCharts;
  tables: IDashboardTables;
}

/** KPIs principales del dashboard */
export interface IDashboardKpis {
  daily_sales_total: number;
  daily_transactions: number;
  monthly_sales_total: number;
  monthly_transactions: number;
  total_products: number;
  low_stock_count: number;
  expiring_soon_count: number;
}

/** Datos para los gráficos */
export interface IDashboardCharts {
  sales_trend: ISalesTrendItem[];
  top_categories: ITopCategoryItem[];
  top_products: ITopProductItem[];
}

/** Punto de datos de tendencia de ventas semanal */
export interface ISalesTrendItem {
  period: string;
  sales: number;
  expenses: number;
}

/** Categoría con total vendido */
export interface ITopCategoryItem {
  name: string;
  total_sold: number;
}

/** Producto más vendido */
export interface ITopProductItem {
  name: string;
  units_sold: number;
  revenue: number;
}

/** Tablas del dashboard */
export interface IDashboardTables {
  recent_sales: IRecentSale[];
  low_stock_products: ILowStockProduct[];
}

export interface IRecentSale {
  id: number;
  client_name: string;
  total: number;
  sale_date: string;
  status: string;
}

export interface ILowStockProduct {
  id: number;
  name: string;
  code: string;
  stock: number;
  min_stock: number;
  category_name: string;
}

/** KPI card para el grid visual */
export interface IDashboardKPI {
  id: string;
  title: string;
  value: number;
  icon: string;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

export type QuickActionId = 'new-sale' | 'add-product' | 'view-inventory' | 'reports' | 'customers' | 'settings';
