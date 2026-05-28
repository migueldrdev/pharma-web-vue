<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Alertas de Stock" subtitle="Productos bajo el stock mínimo" />
    <q-card flat bordered>
      <q-card-section>
        <q-table :rows="items" :columns="columns" :loading="loading" row-key="id" flat dense>
          <template #body-cell-stock="props">
            <q-td :props="props">
              <q-chip :color="(Number(props.value) <= 5) ? 'negative' : 'warning'" text-color="white" size="sm">{{ props.value }}</q-chip>
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

interface Item { id: number; name: string; code: string; stock: number; min_stock: number; }
const { fetchHttpResource } = useFetchHttp();
const $q = useQuasar();
const items = ref<Item[]>([]);
const loading = ref(false);
const columns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Código', field: 'code', align: 'left' as const },
  { name: 'stock', label: 'Stock Actual', field: 'stock', align: 'center' as const },
  { name: 'min_stock', label: 'Stock Mínimo', field: 'min_stock', align: 'center' as const },
];

onMounted(async () => {
  loading.value = true;
  try {
    const r = await fetchHttpResource({ path: '/product', method: 'get' as never });
    const all = Array.isArray(r.data) ? r.data : (r.data as any)?.data || [];
    items.value = (all as Item[]).filter((p) => Number(p.stock) <= Number(p.min_stock));
  } catch { $q.notify({ type: 'negative', message: 'Error' }); }
  finally { loading.value = false; }
});
</script>
