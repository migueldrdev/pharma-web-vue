<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Compras" subtitle="Historial de compras realizadas">
      <template #actions>
        <q-btn color="primary" icon="add" label="Nueva Compra" :to="{ name: 'new-purchase' }" unelevated />
        <q-btn icon="refresh" @click="loadPurchases" flat round color="grey"><q-tooltip>Actualizar</q-tooltip></q-btn>
      </template>
    </AppPageHeader>

    <q-card flat bordered>
      <q-card-section>
        <q-input v-model="filter" label="Buscar compras" outlined dense clearable debounce="300" class="q-mb-md">
          <template #prepend><q-icon name="search" /></template>
        </q-input>

        <q-table
          :rows="purchases"
          :columns="columns"
          :loading="loading"
          :filter="filter"
          row-key="id"
          flat
          dense
          :rows-per-page-options="[15, 25, 50]"
          @row-click="(_, row) => viewPurchase(row)"
        >
          <template #body-cell-total="props">
            <q-td :props="props"><span class="text-green-8">S/ {{ Number(props.value).toFixed(2) }}</span></q-td>
          </template>
          <template #body-cell-purchase_date="props">
            <q-td :props="props">{{ props.value ? new Date(props.value).toLocaleDateString('es-PE') : '-' }}</q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn icon="visibility" size="sm" flat round color="info" @click.stop="viewPurchase(props.row)"><q-tooltip>Ver</q-tooltip></q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { resources } from './api-resource/ApiResource';
import { useFetchHttp } from '@composables/useFetchHttp';

const { fetchHttpResource } = useFetchHttp();
const $q = useQuasar();
const purchases = ref<Record<string, unknown>[]>([]);
const loading = ref(false);
const filter = ref('');

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'purchase_date', label: 'Fecha', field: 'purchase_date', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const },
  { name: 'supplier_name', label: 'Proveedor', field: 'supplier_name', align: 'left' as const },
  { name: 'actions', label: '', field: 'id', align: 'center' as const },
];

async function loadPurchases() {
  loading.value = true;
  try {
    const res = await fetchHttpResource(resources.allPurchases());
    purchases.value = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
  } catch { $q.notify({ type: 'negative', message: 'Error al cargar compras' }); }
  finally { loading.value = false; }
}

function viewPurchase(row: Record<string, unknown>) {
  $q.notify({ type: 'info', message: `Compra #${row.id}`, timeout: 2000 });
}

onMounted(() => { void loadPurchases(); });
</script>
