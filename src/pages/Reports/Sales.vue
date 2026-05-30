<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Reporte de Ventas" subtitle="Análisis y resumen de ventas realizadas" />
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section><div class="text-caption text-grey">Total Ventas Hoy</div><div class="text-h4 text-primary">S/ {{ todayRevenue.toFixed(2) }}</div></q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section><div class="text-caption text-grey">Ventas del Mes</div><div class="text-h4 text-positive">S/ {{ monthRevenue.toFixed(2) }}</div></q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section><div class="text-caption text-grey">Transacciones</div><div class="text-h4 text-accent">{{ totalSales }}</div></q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section><div class="text-caption text-grey">Ticket Promedio</div><div class="text-h4 text-warning">S/ {{ avgTicket.toFixed(2) }}</div></q-card-section></q-card>
      </div>
    </div>
    <q-card flat bordered><q-card-section>
      <div class="text-subtitle1 text-primary q-mb-md">Historial de Ventas</div>
      <q-table :rows="sales" :columns="columns" :loading="loading" row-key="id" flat dense :rows-per-page-options="[10, 20, 50]">
        <template #body-cell-total="p"><q-td :props="p"><span class="text-green-8">S/ {{ Number(p.value).toFixed(2) }}</span></q-td></template>
        <template #body-cell-sale_date="p"><q-td :props="p">{{ p.value ? new Date(String(p.value)).toLocaleDateString('es-PE') : '-' }}</q-td></template>
      </q-table>
    </q-card-section></q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { useFetchHttp } from '@composables/useFetchHttp';

interface Sale { id: number; sale_date: string; total: number; customer_name?: string; }

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

const todayRevenue = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return sales.value.filter((s) => String(s.sale_date ?? '').startsWith(today)).reduce((s, x) => s + Number(x.total || 0), 0);
});
const monthRevenue = computed(() => sales.value.reduce((s, x) => s + Number(x.total || 0), 0));
const totalSales = computed(() => sales.value.length);
const avgTicket = computed(() => totalSales.value ? monthRevenue.value / totalSales.value : 0);

onMounted(async () => {
  loading.value = true;
  try {
    const r = await fetchHttpResource({ path: '/sale', method: 'get' as never });
    sales.value = Array.isArray(r.data) ? r.data as Sale[] : ((r.data as unknown as Record<string, unknown>)?.data as Sale[]) || [];
  } catch { $q.notify({ type: 'negative', message: 'Error al cargar ventas' }); }
  finally { loading.value = false; }
});
</script>
