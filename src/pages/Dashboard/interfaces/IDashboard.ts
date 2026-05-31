export interface IDashboardData {
  dailySales: number;
  monthlySales: number;
  productsSold: number;
  clientsServed: number;
  productsInStock: number;
  productsExpiring: number;
  lowStockCount: number;
}

export interface ISaleRecord {
  id: number;
  sale_date: string;
  total: number;
  customer_name?: string;
  client_name?: string;
  details?: { quantity: number }[];
}

export interface IProductRecord {
  id: number;
  name: string;
  code?: string;
  stock: number;
  min_stock?: number;
  price?: number;
  status?: string;
  category_name?: string;
  expiration_date?: string;
}

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
