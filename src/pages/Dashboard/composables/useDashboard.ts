import { ref, computed } from 'vue';
import { useFetchHttp, HttpMethods } from '@composables/useFetchHttp';
import { useNotify } from '@composables/useNotify';
import type {
  IDashboardResponse,
  IDashboardKPI,
  ISalesTrendItem,
  ITopProductItem,
} from '../interfaces/IDashboard';

export function useDashboard() {
  const { fetchHttpResource } = useFetchHttp();
  const { warning } = useNotify();
  const loading = ref(false);

  const data = ref<IDashboardResponse>();

  // ─── KPI Cards ───────────────────────────────────────────────
  const kpis = computed<IDashboardKPI[]>(() => {
    const k = data.value?.kpis;
    if (!k) return [];
    return [
      {
        id: 'daily-sales',
        title: 'Ventas Hoy',
        value: k.daily_sales_total,
        icon: 'point_of_sale',
        prefix: 'S/ ',
        trend: 'up',
        trendValue: `${k.daily_transactions} trans.`,
        color: 'primary',
      },
      {
        id: 'monthly-sales',
        title: 'Ingresos del Mes',
        value: k.monthly_sales_total,
        icon: 'account_balance_wallet',
        prefix: 'S/ ',
        trend: 'up',
        trendValue: `${k.monthly_transactions} trans.`,
        color: 'positive',
      },
      {
        id: 'total-products',
        title: 'Productos en Stock',
        value: k.total_products,
        icon: 'inventory',
        color: 'secondary',
      },
      {
        id: 'low-stock',
        title: 'Stock Bajo',
        value: k.low_stock_count,
        icon: 'warning',
        trend: k.low_stock_count > 0 ? 'down' : 'neutral',
        trendValue: 'productos',
        color: 'warning',
      },
      {
        id: 'expiring',
        title: 'Por Vencer',
        value: k.expiring_soon_count,
        icon: 'event_busy',
        trend: 'down',
        trendValue: '30 días',
        color: 'negative',
      },
      {
        id: 'transactions',
        title: 'Transacciones Mes',
        value: k.monthly_transactions,
        icon: 'receipt_long',
        trend: 'up',
        trendValue: 'total',
        color: 'accent',
      },
    ];
  });

  // ─── Tablas ──────────────────────────────────────────────────
  const recentSales = computed(
    () =>
      data.value?.tables.recent_sales?.map((s) => ({
        id: s.id,
        client: s.client_name ?? 'Anónimo',
        total: s.total,
        date: s.sale_date ? new Date(s.sale_date).toLocaleDateString('es-PE') : '-',
        status: s.status === 'activo' ? 'active' : 'inactive',
      })) ?? [],
  );

  const lowStockProducts = computed(
    () =>
      data.value?.tables.low_stock_products?.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code ?? '-',
        stock: p.stock,
        min_stock: p.min_stock,
        category: p.category_name ?? '—',
      })) ?? [],
  );

  // ─── Charts: Tendencia de ventas ─────────────────────────────
  const salesTrendRaw = computed<ISalesTrendItem[]>(
    () => data.value?.charts.sales_trend ?? [],
  );

  const salesTrendLabels = computed(() =>
    salesTrendRaw.value.map((t) => t.period),
  );

  const salesTrendData = computed(() =>
    salesTrendRaw.value.map((t) => t.sales),
  );

  const expensesTrendData = computed(() =>
    salesTrendRaw.value.map((t) => t.expenses),
  );

  // ─── Charts: Categorías (Pie chart) ──────────────────────────
  // Mapeo de backend (total_sold) a Highcharts (y) ocurre AQUÍ
  const topCategoriesChartData = computed<{ name: string; y: number }[]>(
    () =>
      data.value?.charts.top_categories.map((c) => ({
        name: c.name,
        y: c.total_sold,
      })) ?? [],
  );

  // ─── Charts: Top productos (nueva gráfica) ──────────────────
  const topProducts = computed<ITopProductItem[]>(
    () => data.value?.charts.top_products ?? [],
  );

  // ─── Fetch ───────────────────────────────────────────────────
  async function refreshData() {
    loading.value = true;
    try {
      const res = await fetchHttpResource<IDashboardResponse>({
        path: '/dashboard',
        method: HttpMethods.Get,
      });
      if (res.success) {
        data.value = res.data;
      }
    } catch {
      if (!data.value) {
        warning('No se pudieron cargar los datos del dashboard', { timeout: 3000 });
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
    // Charts: Sales Trend
    salesTrendLabels,
    salesTrendData,
    expensesTrendData,
    // Charts: Categories (Pie)
    topCategoriesChartData,
    // Charts: Top Products
    topProducts,
    refreshData,
  };
}
