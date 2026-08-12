<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <AppPageHeader 
      title="Alertas de Stock" 
      subtitle="Productos que requieren reabastecimiento urgente"
    >
      <template #actions>
        <q-btn 
          outline 
          color="primary" 
          icon="mdi-refresh" 
          label="Actualizar" 
          :loading="loading" 
          @click="loadStockAlerts" 
          class="pharma-btn"
        />
      </template>
    </AppPageHeader>

    <!-- Filtros -->
    <q-card flat class="pharma-card q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              v-model="searchQuery"
              dense
              outlined
              class="pharma-input-inset"
              placeholder="Buscar por producto o código..."
              debounce="300"
            >
              <template #prepend>
                <q-icon name="mdi-magnify" />
              </template>
              <template #append>
                <q-icon 
                  v-if="searchQuery" 
                  name="mdi-close" 
                  class="cursor-pointer" 
                  @click="searchQuery = ''" 
                />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Estado Vacío -->
    <AppEmptyState
      v-if="!loading && filteredAlerts.length === 0 && !searchQuery"
      icon="check_circle"
      icon-color="positive"
      title="Stock saludable"
      description="No hay alertas de reabastecimiento en este momento."
    >
      <template #actions>
        <q-btn 
          unelevated 
          color="primary" 
          icon="mdi-refresh" 
          label="Volver a verificar" 
          @click="loadStockAlerts" 
          class="q-mt-md"
        />
      </template>
    </AppEmptyState>

    <AppEmptyState
      v-else-if="!loading && filteredAlerts.length === 0 && searchQuery"
      icon="mdi-text-box-search-outline"
      title="Sin resultados"
      description="No se encontraron alertas que coincidan con la búsqueda."
    />

    <!-- Tabla -->
    <q-table
      v-else
      :rows="filteredAlerts"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      class="bg-transparent pharma-table"
      :rows-per-page-options="[10, 25, 50, 100]"
      :pagination="{ rowsPerPage: 25 }"
    >
      <!-- Producto -->
      <template #body-cell-product_name="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-icon name="mdi-pill" size="sm" color="primary" class="q-mr-sm" />
            <div>
              <div class="text-weight-bold">{{ props.value }}</div>
              <div class="text-caption text-grey-7">{{ props.row.product_code }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- Stock -->
      <template #body-cell-current_stock="props">
        <q-td :props="props">
          <div class="row items-center justify-center no-wrap">
            <q-badge 
              outline
              :color="props.row.severity === 'critical' ? 'negative' : (props.row.severity === 'warning' ? 'warning' : 'info')"
              class="text-weight-bold q-px-sm q-py-xs text-subtitle2"
            >
              {{ props.value }}
            </q-badge>
            <span class="text-caption text-grey q-mx-xs">/</span>
            <span class="text-caption text-grey-8">Mín: {{ props.row.min_stock }}</span>
          </div>
        </q-td>
      </template>

      <!-- Severidad -->
      <template #body-cell-severity="props">
        <q-td :props="props">
          <AppStatusBadge :status="props.value" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNotify } from '@composables/useNotify';
import { useFetchHttp } from '@composables/useFetchHttp';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppStatusBadge from '@components/shared/AppStatusBadge.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import { alertResources } from '@api-resources/alertResource';

defineOptions({ name: 'StockAlertsPage' });

interface StockAlertItem {
  id: number;
  product_name: string;
  product_code: string;
  current_stock: number;
  min_stock: number;
  stock_percentage: number;
  severity: string;
  message: string;
}

const { fetchHttpResource } = useFetchHttp();
const { error } = useNotify();

const alerts = ref<StockAlertItem[]>([]);
const loading = ref(false);
const searchQuery = ref('');

const columns = [
  { name: 'product_name', label: 'Producto', field: 'product_name', align: 'left' as const, sortable: true },
  { name: 'current_stock', label: 'Estado del Stock', field: 'current_stock', align: 'center' as const, sortable: true },
  { name: 'severity', label: 'Prioridad', field: 'severity', align: 'center' as const, sortable: true },
  { name: 'message', label: 'Detalle', field: 'message', align: 'left' as const },
];

const filteredAlerts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return alerts.value;
  return alerts.value.filter(alert => 
    alert.product_name.toLowerCase().includes(query) || 
    alert.product_code.toLowerCase().includes(query)
  );
});

async function loadStockAlerts() {
  loading.value = true;
  try {
    const res = await fetchHttpResource<{ alerts: StockAlertItem[] }>(alertResources.stock, false);
    if (res.success && res.data) {
      alerts.value = Array.isArray(res.data.alerts) ? res.data.alerts : [];
    }
  } catch {
    error('Error al cargar alertas de stock');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadStockAlerts();
});
</script>
