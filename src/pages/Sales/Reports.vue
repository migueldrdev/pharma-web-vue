<template>
  <q-page class="q-pa-md">
    <AppPageHeader 
      title="Reportes de Ventas" 
      subtitle="Análisis de rendimiento y ventas recientes" 
    >
      <template #actions>
        <q-btn icon="refresh" flat round @click="load()" :loading="loading" />
      </template>
    </AppPageHeader>

    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-md-4 col-sm-6 col-xs-12">
        <AppKpiCard
          title="Ventas Hoy"
          :value="dailyTotal.toFixed(2)"
          prefix="S/ "
          icon="point_of_sale"
          color="primary"
          :trendValue="`${dailyCount} transacciones`"
          trend="up"
          :loading="loading"
        />
      </div>
      <div class="col-md-4 col-sm-6 col-xs-12">
        <AppKpiCard
          title="Ventas del Mes"
          :value="monthlyTotal.toFixed(2)"
          prefix="S/ "
          icon="account_balance_wallet"
          color="positive"
          :trendValue="`${monthlyCount} transacciones`"
          trend="up"
          :loading="loading"
        />
      </div>
      
      <div class="col-12">
        <q-card flat bordered class="pharma-card">
          <q-card-section>
            <q-table
              :rows="sales"
              :columns="columns"
              :loading="loading"
              row-key="id"
              flat
              class="bg-transparent"
              hide-pagination
              :rows-per-page-options="[30]"
            >
              <template #body-cell-id="props">
                <q-td :props="props">
                  <span class="text-weight-medium text-grey-8">#{{ props.value }}</span>
                </q-td>
              </template>
              <template #body-cell-sale_date="props">
                <q-td :props="props">
                  <q-chip outline color="primary" size="sm" dense class="text-weight-medium">
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-customer_name="props">
                <q-td :props="props">
                  <div class="row items-center no-wrap">
                    <q-avatar size="24px" color="primary" text-color="white" class="q-mr-sm text-weight-bold">
                      {{ props.value !== 'Anónimo' ? props.value.charAt(0).toUpperCase() : 'A' }}
                    </q-avatar>
                    <span>{{ props.value }}</span>
                  </div>
                </q-td>
              </template>
              <template #body-cell-total="props">
                <q-td :props="props">
                  <span class="text-weight-bold text-teal">S/ {{ Number(props.value).toFixed(2) }}</span>
                </q-td>
              </template>
              
              <template #no-data>
                <div class="full-width row flex-center q-pa-md">
                  <AppEmptyState
                    icon="assessment"
                    title="Sin registros de ventas"
                    description="No se encontraron ventas para mostrar en este momento."
                  />
                </div>
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
import { useNotify } from '@composables/useNotify';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppKpiCard from '@components/shared/AppKpiCard.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import { resources } from '@api-resources/GeneralApiResource';
import { useFetchHttp } from '@composables/useFetchHttp';

interface Sale { id: number; sale_date: string; total: number; customer_name: string }
const { fetchHttpResource } = useFetchHttp();
const { error } = useNotify();

const sales = ref<Sale[]>([]);
const loading = ref(false);

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'sale_date', label: 'Fecha', field: 'sale_date', align: 'left' as const },
  { name: 'customer_name', label: 'Cliente', field: (r: Sale) => r.customer_name || 'Anónimo', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const },
];

const dailyTotal = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return sales.value
    .filter((s) => (s.sale_date || '').startsWith(today))
    .reduce((s, x) => s + (Number(x.total) || 0), 0);
});
const dailyCount = computed(() =>
  sales.value.filter((s) => (s.sale_date || '').startsWith(new Date().toISOString().slice(0, 10))).length,
);
const monthlyTotal = computed(() => sales.value.reduce((s, x) => s + (Number(x.total) || 0), 0));
const monthlyCount = computed(() => sales.value.length);

async function load() {
  loading.value = true;
  try {
    const response = await fetchHttpResource<{ data: Sale[] }>(resources.allSales);
    const payload = response.data as unknown as { data?: Sale[] };
    sales.value = Array.isArray(response.data) ? (response.data as Sale[]) : payload?.data || [];
  } catch {
    error('Error al cargar datos');
  } finally {
    loading.value = false;
  }
}

onMounted(() => load());
</script>

<style lang="scss" scoped>
.pharma-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}
.text-teal {
  color: #00B4A6 !important;
}
</style>
