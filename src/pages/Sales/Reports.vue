<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Reportes de Ventas" subtitle="Análisis de rendimiento" />

    <div class="row q-col-gutter-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Total Ventas Hoy</div>
            <div class="text-h4 text-primary">S/ {{ dailyTotal.toFixed(2) }}</div>
            <q-separator class="q-my-sm" />
            <div class="text-caption">{{ dailyCount }} transacciones</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Total del Mes</div>
            <div class="text-h4 text-positive">S/ {{ monthlyTotal.toFixed(2) }}</div>
            <q-separator class="q-my-sm" />
            <div class="text-caption">{{ monthlyCount }} transacciones</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-primary q-mb-md">Últimos 30 días</div>
            <q-table
              :rows="sales"
              :columns="columns"
              :loading="loading"
              row-key="id"
              dense
              flat
              hide-pagination
              :rows-per-page-options="[30]"
            >
              <template #body-cell-total="props">
                <q-td :props="props">
                  <span class="text-green-8">S/ {{ Number(props.value).toFixed(2) }}</span>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { resources } from './api-resource/ApiResource';
import { useFetchHttp } from '@composables/useFetchHttp';

interface Sale { id: number; sale_date: string; total: number; customer_name: string }
const { fetchHttpResource } = useFetchHttp();
const $q = useQuasar();

const sales = ref<Sale[]>([]);
const loading = ref(false);

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'sale_date', label: 'Fecha', field: 'sale_date', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const },
  { name: 'customer_name', label: 'Cliente', field: (r: Sale) => r.customer_name || 'Anónimo', align: 'left' as const },
];

const dailyTotal = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return sales.value
    .filter((s) => (s.sale_date || '').startsWith(today))
    .reduce((s, x) => s + (Number(x.total) || 0), 0);
});
const dailyCount = computed(() =>
  sales.value.filter((s) => (s.sale_date || '').startsWith(new Date().toISOString().split('T')[0])).length,
);
const monthlyTotal = computed(() => sales.value.reduce((s, x) => s + (Number(x.total) || 0), 0));
const monthlyCount = computed(() => sales.value.length);

onMounted(async () => {
  loading.value = true;
  try {
    const response = await fetchHttpResource<{ data: Sale[] }>(resources.allSales());
    sales.value = Array.isArray(response.data) ? response.data as Sale[] : (response.data as any)?.data || [];
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos' });
  } finally {
    loading.value = false;
  }
});
</script>
