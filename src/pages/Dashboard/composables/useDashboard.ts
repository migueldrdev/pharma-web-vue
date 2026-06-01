import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import { useFetchHttp, HttpMethods } from '@composables/useFetchHttp';
import type { IDashboardKPI } from '../interfaces/IDashboard';

interface DashboardData {
  daily_sales_total: number;
  daily_transactions: number;
  monthly_sales_total: number;
  monthly_transactions: number;
  total_products: number;
  low_stock_count: number;
  expiring_soon_count: number;
  sales_trend: number[];
  top_categories: { name: string; y: number }[];
  recent_sales: { id: number; client_name: string; total: number; sale_date: string; status: string }[];
  low_stock_products: { id: number; name: string; code: string; stock: number; min_stock: number; category_name: string }[];
}

export function useDashboard() {
  const { fetchHttpResource } = useFetchHttp();
  const loading = ref(false);

  const data = ref<DashboardData | null>(null);

  const kpis = computed<IDashboardKPI[]>(() => {
    if (!data.value) return [];
    return [
      { id: 'daily-sales', title: 'Ventas Hoy', value: data.value.daily_sales_total, icon: 'point_of_sale', prefix: 'S/ ', trend: 'up', trendValue: `${data.value.daily_transactions} trans.`, color: 'primary' },
      { id: 'monthly-sales', title: 'Ingresos del Mes', value: data.value.monthly_sales_total, icon: 'account_balance_wallet', prefix: 'S/ ', trend: 'up', trendValue: `${data.value.monthly_transactions} trans.`, color: 'positive' },
      { id: 'total-products', title: 'Productos en Stock', value: data.value.total_products, icon: 'inventory', color: 'secondary' },
      { id: 'low-stock', title: 'Stock Bajo', value: data.value.low_stock_count, icon: 'warning', trend: data.value.low_stock_count > 0 ? 'down' : 'neutral', trendValue: 'productos', color: 'warning' },
      { id: 'expiring', title: 'Por Vencer', value: data.value.expiring_soon_count, icon: 'event_busy', trend: 'down', trendValue: '30 días', color: 'negative' },
      { id: 'transactions', title: 'Transacciones Mes', value: data.value.monthly_transactions, icon: 'receipt_long', trend: 'up', trendValue: 'total', color: 'accent' },
    ];
  });

  const recentSales = computed(() => data.value?.recent_sales?.map((s) => ({
    id: s.id,
    client: s.client_name ?? 'Anónimo',
    total: s.total,
    date: s.sale_date ? new Date(s.sale_date).toLocaleDateString('es-PE') : '-',
    status: s.status === 'activo' ? 'active' : 'inactive',
  })) ?? []);

  const lowStockProducts = computed(() => data.value?.low_stock_products?.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code ?? '-',
    stock: p.stock,
    min_stock: p.min_stock,
    category: p.category_name ?? '—',
  })) ?? []);

  const salesTrend = computed(() => data.value?.sales_trend ?? [0, 0, 0, 0]);

  const topProductsNames: [string, number][] = data.value?.top_categories.map((c) => [c.name, c.y] as [string, number]) ?? [];

  async function refreshData() {
    loading.value = true;
    try {
      const res = await fetchHttpResource<DashboardData>({ path: '/dashboard', method: HttpMethods.Get });
      if (res.success) {
        data.value = res.data;
      }
    } catch {
      if (!data.value) {
        Notify.create({ type: 'warning', message: 'No se pudieron cargar los datos del dashboard', timeout: 3000 });
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    kpis,
    recentSales,
    lowStockProducts,
    salesTrend,
    topProductsNames: computed(() => topProductsNames),
    refreshData,
  };
}
