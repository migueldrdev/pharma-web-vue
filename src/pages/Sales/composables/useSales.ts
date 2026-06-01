import { ref } from 'vue';
import { Notify } from 'quasar';
import { useFetchHttp } from '@composables/useFetchHttp';
import { saleResources } from '../api-resource/saleResource';
import type { ISale } from '../interfaces/ISale';

export function useSales() {
  const { fetchHttpResource } = useFetchHttp();
  const sales = ref<ISale[]>([]);
  const loading = ref(false);
  const filter = ref('');
  const pagination = ref({ page: 1, rowsPerPage: 25, rowsNumber: 0, sortBy: 'sale_date', descending: true });

  async function loadSales(params?: Record<string, unknown>) {
    loading.value = true;
    try {
      const qp: Record<string, unknown> = {
        page: pagination.value.page,
        per_page: pagination.value.rowsPerPage,
        ...(params || {}),
      };
      if (filter.value) qp.search = filter.value;

      const res = await fetchHttpResource<ISale[]>(saleResources.list(qp), false);
      const payload = res.data as unknown as { data?: ISale[]; total?: number; items?: ISale[] };
      sales.value = payload?.data ?? payload?.items ?? (Array.isArray(res.data) ? res.data : []);
      pagination.value.rowsNumber = payload?.total ?? sales.value.length;
    } catch { Notify.create({ type: 'negative', message: 'Error al cargar ventas' }); }
    finally { loading.value = false; }
  }

  return { sales, loading, filter, pagination, loadSales };
}
