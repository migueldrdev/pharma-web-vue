<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Notify } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { productResources } from '@pages/Inventory/Products/api-resource/productResource';
import AppStatusChip from '@components/shared/AppStatusChip.vue';

defineOptions({ name: 'ExpiryAlertsPage' });

interface ExpiryItem { id: number; name: string; batch: string; stock: number; expiration_date: string; }
const { fetchHttpResource } = useFetchHttp();
const items = ref<ExpiryItem[]>([]);
const loading = ref(false);

const columns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'batch', label: 'Lote', field: 'batch', align: 'left' as const },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' as const },
  { name: 'expiration_date', label: 'Vencimiento', field: 'expiration_date', align: 'center' as const },
];

function isExpired(d: string) { return new Date(d) < new Date(); }

onMounted(async () => {
  loading.value = true;
  try {
    const res = await fetchHttpResource<ExpiryItem[]>(productResources.list({ expiring_soon: 'true', per_page: 50, page: 1 }), false);
    const payload = res.data as unknown as { data?: ExpiryItem[] };
    items.value = payload?.data ?? (Array.isArray(res.data) ? res.data as ExpiryItem[] : []);
  } catch { Notify.create({ type: 'negative', message: 'Error al cargar' }); }
  finally { loading.value = false; }
});
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Productos por Vencer" subtitle="Lotes próximos a caducar (30 días)" />
    <q-card flat bordered>
      <q-table :rows="items" :columns="columns" row-key="id" :loading="loading" flat>
        <template #body-cell-expiration_date="{ value }">
          <q-td><AppStatusChip :status="isExpired(value) ? 'error' : 'warning'" :label="value" /></q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>
