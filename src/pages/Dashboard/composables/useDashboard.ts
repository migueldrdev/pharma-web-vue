import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import { useFetchHttp } from '@composables/useFetchHttp';
import type {
  IDashboardKPI,
  ISaleRecord,
  IProductRecord,
} from '../interfaces/IDashboard';

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
  const firstLoad = ref(true);

  const sales = ref<ISaleRecord[]>([]);
  const products = ref<IProductRecord[]>([]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const kpis = computed<IDashboardKPI[]>(() => {
    const dailySales = sales.value
      .filter((s) => (s.sale_date || '').startsWith(todayStr))
      .reduce((sum, s) => sum + Number(s.total || 0), 0);

    const monthlySales = sales.value
      .reduce((sum, s) => sum + Number(s.total || 0), 0);

    const lowStock = products.value.filter((p) => p.stock <= (p.min_stock || 10));
    const expiring = products.value.filter(
      (p) => p.expiration_date && new Date(p.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    );

    return [
      { id: 'daily-sales', title: 'Ventas Hoy', value: dailySales, icon: 'point_of_sale', prefix: 'S/ ', trend: 'up', trendValue: `${sales.value.length} trans.`, color: 'primary' },
      { id: 'products-sold', title: 'Productos Vendidos', value: sales.value.reduce((s, sale) => s + (sale.details?.reduce((d, item) => d + (item.quantity || 0), 0) || 0), 0), icon: 'medication', trend: 'up', trendValue: 'hoy', color: 'accent' },
      { id: 'products-stock', title: 'Productos en Stock', value: products.value.length, icon: 'inventory', color: 'secondary' },
      { id: 'monthly-sales', title: 'Ingresos del Mes', value: monthlySales, icon: 'account_balance_wallet', prefix: 'S/ ', trend: 'up', trendValue: 'este mes', color: 'positive' },
      { id: 'low-stock', title: 'Stock Bajo', value: lowStock.length, icon: 'warning', trend: lowStock.length > 0 ? 'down' : 'neutral', trendValue: 'productos', color: 'warning' },
      { id: 'expiring', title: 'Por Vencer', value: expiring.length, icon: 'event_busy', trend: 'down', trendValue: '30 días', color: 'negative' },
    ];
  });

  const recentSales = computed(() =>
    sales.value.slice(0, 10).map((s) => ({
      id: s.id,
      client: s.customer_name || s.client_name || 'Anónimo',
      total: s.total,
      date: s.sale_date ? new Date(s.sale_date).toLocaleDateString('es-PE') : '-',
      status: 'activo',
    })),
  );

  const lowStockProducts = computed(() =>
    products.value
      .filter((p) => p.stock <= (p.min_stock || 10))
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code || '-',
        stock: p.stock,
        min_stock: p.min_stock || 10,
        category: p.category_name || '—',
      })),
  );

  const salesTrend = computed(() =>
    ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((_w, i) =>
      sales.value
        .filter((s) => {
          const d = new Date(s.sale_date);
          const start = new Date(todayStr);
          start.setDate(start.getDate() - (4 - i) * 7);
          const end = new Date(start);
          end.setDate(end.getDate() + 7);
          return d >= start && d < end;
        })
        .reduce((sum, s) => sum + Number(s.total || 0), 0),
    ),
  );

  const topProductsNames = computed(() => {
    const counts: Record<string, number> = {};
    products.value.forEach((p) => {
      if (p.category_name) counts[p.category_name] = (counts[p.category_name] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5);
  });

  async function refreshData() {
    loading.value = true;
    try {
      const dashboardRes = await fetchHttpResource<DashboardData>({
        path: '/dashboard',
        method: 'get' as never,
      });

      if (dashboardRes.success && dashboardRes.data) {
        const d = dashboardRes.data as DashboardData;
        // Mapear KPIs del backend al formato del frontend
        sales.value = (d.recent_sales || []).map((s) => ({
          id: s.id,
          sale_date: s.sale_date,
          total: s.total,
          customer_name: s.client_name,
          client_name: s.client_name,
          details: [],
          active: true,
        })) as unknown as ISaleRecord[];

        // Usar low_stock_products para products
        if ((d as any).low_stock_products) {
          products.value = (d as any).low_stock_products.map((p: any) => ({
            id: p.id, name: p.name, code: p.code || '-',
            stock: p.stock, min_stock: p.min_stock || 10,
            category_name: p.category_name || '-',
            expiration_date: null,
          })) as IProductRecord[];
        }
      }

      firstLoad.value = false;
    } catch {
      if (firstLoad.value) {
        Notify.create({ type: 'warning', message: 'Usando datos de ejemplo', timeout: 2000 });
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
    topProductsNames,
    refreshData,
  };
}
