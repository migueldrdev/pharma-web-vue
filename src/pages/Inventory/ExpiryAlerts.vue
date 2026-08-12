<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <AppPageHeader 
      title="Productos por Vencer" 
      subtitle="Lotes próximos a caducar en el inventario"
    >
      <template #actions>
        <q-btn 
          outline 
          color="primary" 
          icon="mdi-refresh" 
          label="Actualizar" 
          :loading="loading" 
          @click="loadExpiryAlerts" 
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
              placeholder="Buscar por producto o lote..."
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
      title="Sin lotes por vencer"
      description="Todos los productos están dentro del margen de seguridad."
    >
      <template #actions>
        <q-btn 
          unelevated 
          color="primary" 
          icon="mdi-refresh" 
          label="Volver a verificar" 
          @click="loadExpiryAlerts" 
          class="q-mt-md"
        />
      </template>
    </AppEmptyState>

    <AppEmptyState
      v-else-if="!loading && filteredAlerts.length === 0 && searchQuery"
      icon="mdi-text-box-search-outline"
      title="Sin resultados"
      description="No se encontraron lotes que coincidan con la búsqueda."
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
            <q-icon name="mdi-package-variant-closed" size="sm" color="primary" class="q-mr-sm" />
            <div class="text-weight-bold">{{ props.value }}</div>
          </div>
        </q-td>
      </template>

      <!-- Lote -->
      <template #body-cell-batch_number="props">
        <q-td :props="props">
          <q-chip 
            outline 
            color="primary" 
            text-color="primary" 
            size="sm" 
            class="text-weight-bold q-px-sm"
          >
            LOTE: {{ props.value }}
          </q-chip>
        </q-td>
      </template>

      <!-- Vencimiento -->
      <template #body-cell-expiration_date="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.value }}</div>
        </q-td>
      </template>

      <!-- Días Restantes -->
      <template #body-cell-days_until_expiry="props">
        <q-td :props="props">
          <AppStatusBadge 
            :status="props.value <= 30 ? 'critical' : (props.value <= 60 ? 'warning' : 'medium')" 
            :label="`${props.value} días`"
          />
        </q-td>
      </template>

      <!-- Estado General -->
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

defineOptions({ name: 'ExpiryAlertsPage' });

interface ExpiryAlertItem {
  id: number;
  batch_number: string;
  product_name: string;
  product_code: string;
  stock: number;
  expiration_date: string;
  days_until_expiry: number;
  severity: string;
  message: string;
}

const { fetchHttpResource } = useFetchHttp();
const { error } = useNotify();

const alerts = ref<ExpiryAlertItem[]>([]);
const loading = ref(false);
const searchQuery = ref('');

const columns = [
  { name: 'product_name', label: 'Producto', field: 'product_name', align: 'left' as const, sortable: true },
  { name: 'batch_number', label: 'Lote', field: 'batch_number', align: 'center' as const },
  { name: 'stock', label: 'Stock del Lote', field: 'stock', align: 'center' as const, sortable: true },
  { name: 'expiration_date', label: 'Vencimiento', field: 'expiration_date', align: 'center' as const, sortable: true },
  { name: 'days_until_expiry', label: 'Tiempo Restante', field: 'days_until_expiry', align: 'center' as const, sortable: true },
  { name: 'severity', label: 'Estado', field: 'severity', align: 'center' as const, sortable: true },
];

const filteredAlerts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return alerts.value;
  return alerts.value.filter(alert => 
    alert.product_name.toLowerCase().includes(query) || 
    alert.batch_number.toLowerCase().includes(query)
  );
});

async function loadExpiryAlerts() {
  loading.value = true;
  try {
    const res = await fetchHttpResource<{ alerts: ExpiryAlertItem[] }>(alertResources.expiry, false);
    if (res.success && res.data) {
      alerts.value = Array.isArray(res.data.alerts) ? res.data.alerts : [];
    }
  } catch {
    error('Error al cargar alertas de vencimiento');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadExpiryAlerts();
});
</script>
