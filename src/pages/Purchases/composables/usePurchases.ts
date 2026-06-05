import { ref } from 'vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { useNotify } from '@composables/useNotify';
import { purchaseResources } from '../api-resource/purchaseResource';
import type { IPurchase } from '../interfaces/IPurchase';

export function usePurchases() {
  const { fetchHttpResource } = useFetchHttp();
  const { error } = useNotify();
  const purchases = ref<IPurchase[]>([]);
  const loading = ref(false);
  const filter = ref('');
  const pagination = ref({ page: 1, rowsPerPage: 25, rowsNumber: 0, sortBy: 'purchase_date', descending: true });

  async function loadPurchases(params?: Record<string, unknown>) {
    loading.value = true;
    try {
      const qp: Record<string, unknown> = { page: pagination.value.page, per_page: pagination.value.rowsPerPage, ...(params || {}) };
      if (filter.value) qp.search = filter.value;
      const res = await fetchHttpResource<IPurchase[]>(purchaseResources.list(qp), false);
      const payload = res.data as unknown as { data?: IPurchase[]; total?: number };
      purchases.value = payload?.data ?? (Array.isArray(res.data) ? res.data : []);
      pagination.value.rowsNumber = payload?.total ?? purchases.value.length;
    } catch { error('Error al cargar compras'); }
    finally { loading.value = false; }
  }

  return { purchases, loading, filter, pagination, loadPurchases };
}
