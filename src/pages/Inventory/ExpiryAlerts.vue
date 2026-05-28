<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Productos por Vencer" subtitle="Lotes próximos a caducar" />
    <q-card flat bordered>
      <q-card-section>
        <q-table :rows="items" :columns="columns" :loading="loading" row-key="id" flat dense>
          <template #body-cell-expiration_date="props">
            <q-td :props="props">
              <q-chip :color="isExpired(props.value) ? 'negative' : 'warning'" text-color="white" size="sm">{{ props.value || '-' }}</q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { useQuasar } from 'quasar';

interface Batch { id: number; batch_number: string; product_name: string; stock: number; expiration_date: string; }
const { fetchHttpResource } = useFetchHttp();
const $q = useQuasar();
const items = ref<Batch[]>([]);
const loading = ref(false);
const columns = [
  { name: 'product_name', label: 'Producto', field: 'product_name', align: 'left' as const },
  { name: 'batch_number', label: 'Lote', field: 'batch_number', align: 'left' as const },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' as const },
  { name: 'expiration_date', label: 'Vencimiento', field: 'expiration_date', align: 'center' as const },
];

function isExpired(date: string) { return date && new Date(date) < new Date(); }

onMounted(async () => {
  loading.value = true;
  try {
    const r = await fetchHttpResource({ path: '/product', method: 'get' as never });
    const all = Array.isArray(r.data) ? r.data : (r.data as any)?.data || [];
    // Filter products with expiring batches - simplified: show all with expiration_date
    items.value = (all as Batch[]).filter((p) => p.expiration_date).slice(0, 20);
  } catch { $q.notify({ type: 'negative', message: 'Error' }); }
  finally { loading.value = false; }
});
</script>
