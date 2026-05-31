import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import { useFetchHttp } from '@composables/useFetchHttp';
import { resources } from '@api-resources/GeneralApiResource';
import type {
  IDashboardKPI,
  ISaleRecord,
  IProductRecord,
} from '../interfaces/IDashboard';

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
      const [salesRes, productsRes] = await Promise.all([
        fetchHttpResource<{ data: ISaleRecord[] }>(resources.allSales),
        fetchHttpResource<{ data: IProductRecord[] }>(resources.allProducts),
      ]);

      if (salesRes.success) {
        const salesData = salesRes.data;
        sales.value = Array.isArray(salesData) ? salesData : (salesData as unknown as { data: ISaleRecord[] })?.data || [];
      }

      if (productsRes.success) {
        const productsData = productsRes.data;
        products.value = Array.isArray(productsData) ? productsData : (productsData as unknown as { data: IProductRecord[] })?.data || [];
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
