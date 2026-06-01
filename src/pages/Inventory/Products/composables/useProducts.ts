import { ref, computed, onMounted } from 'vue';
import { Notify, Loading } from 'quasar';
import { useFetchHttp, type IHttpResponse } from '@composables/useFetchHttp';
import { productResources } from '../api-resource/productResource';
import type { IProduct, IProductFilters, IProductPagination } from '../interfaces/IProduct';

export function useProducts() {
  const { fetchHttpResource } = useFetchHttp();

  const products = ref<IProduct[]>([]);
  const loading = ref(false);
  const selectedProducts = ref<IProduct[]>([]);

  const filters = ref<IProductFilters>({
    search: '',
    category_id: null,
    lab_id: null,
    product_type_id: null,
    stock_status: null,
  });

  const pagination = ref<IProductPagination>({
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
    sortBy: 'name',
    descending: false,
  });

  async function loadProducts() {
    loading.value = true;
    try {
      const cleanFilters: Record<string, unknown> = {};
      if (filters.value.search) cleanFilters.search = filters.value.search;
      if (filters.value.category_id) cleanFilters.category_id = filters.value.category_id;
      if (filters.value.lab_id) cleanFilters.lab_id = filters.value.lab_id;
      if (filters.value.product_type_id) cleanFilters.product_type_id = filters.value.product_type_id;
      if (filters.value.stock_status) cleanFilters.stock_status = filters.value.stock_status;

      cleanFilters.page = pagination.value.page;
      cleanFilters.per_page = pagination.value.rowsPerPage;

      const res = await fetchHttpResource<IProduct[]>(
        productResources.list(cleanFilters),
        false,
      );

      if (res.success && Array.isArray(res.data)) {
        products.value = res.data;
        pagination.value.rowsNumber = (res.data as unknown as { total?: number }).total ?? res.data.length;
      } else {
        const payload = res.data as unknown as { data?: IProduct[]; total?: number };
        products.value = payload?.data ?? [];
        pagination.value.rowsNumber = payload?.total ?? 0;
      }
    } catch (_e: unknown) {
      Notify.create({ type: 'negative', message: 'Error al cargar productos' });
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: number) {
    try {
      await fetchHttpResource(productResources.delete(id));
      Notify.create({ type: 'positive', message: 'Producto eliminado' });
      await loadProducts();
    } catch {
      Notify.create({ type: 'negative', message: 'Error al eliminar' });
    }
  }

  async function deleteMultiple() {
    Loading.show({ message: 'Eliminando...' });
    try {
      for (const p of selectedProducts.value) {
        await fetchHttpResource(productResources.delete(p.id));
      }
      selectedProducts.value = [];
      Notify.create({ type: 'positive', message: 'Productos eliminados' });
      await loadProducts();
    } catch {
      Notify.create({ type: 'negative', message: 'Error al eliminar' });
    } finally {
      Loading.hide();
    }
  }

  const emptyFilters = computed(() =>
    !filters.value.search &&
    !filters.value.category_id &&
    !filters.value.lab_id &&
    !filters.value.product_type_id &&
    !filters.value.stock_status,
  );

  return {
    products, loading, selectedProducts, filters, pagination,
    loadProducts, deleteProduct, deleteMultiple, emptyFilters,
  };
}
