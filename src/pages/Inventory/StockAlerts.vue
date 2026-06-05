<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotify } from '@composables/useNotify';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppConfirmDialog from '@components/shared/AppConfirmDialog.vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { productResources } from '@pages/Inventory/Products/api-resource/productResource';
import AppStatusChip from '@components/shared/AppStatusChip.vue';

defineOptions({ name: 'StockAlertsPage' });

interface StockItem { id: number; name: string; code: string; stock: number; min_stock: number; }
const { fetchHttpResource } = useFetchHttp();
const { error } = useNotify();
const items = ref<StockItem[]>([]);
const loading = ref(false);

const columns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Código', field: 'code', align: 'left' as const },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' as const },
  { name: 'min_stock', label: 'Mínimo', field: 'min_stock', align: 'center' as const },
];

onMounted(async () => {
  loading.value = true;
  try {
    const res = await fetchHttpResource<StockItem[]>(productResources.list({ stock_status: 'low', per_page: 50, page: 1 }), false);
    const payload = res.data as unknown as { data?: StockItem[] };
    items.value = payload?.data ?? (Array.isArray(res.data) ? res.data as StockItem[] : []);
  } catch { error('Error al cargar alertas'); }
  finally { loading.value = false; }
});
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Alertas de Stock" subtitle="Productos bajo el stock mínimo" />
    <q-card flat bordered>
      <q-table :rows="items" :columns="columns" row-key="id" :loading="loading" flat>
        <template #body-cell-stock="{ value }">
          <q-td><AppStatusChip :status="value <= 5 ? 'error' : 'warning'" :label="String(value)" /></q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>
