<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Ventas" subtitle="Historial de ventas realizadas">
      <template #actions>
        <q-btn
          color="primary"
          icon="add"
          label="Nueva Venta"
          :to="{ name: 'new-sale' }"
          unelevated
        />
        <q-btn icon="refresh" @click="loadSales" flat round color="grey">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </template>
    </AppPageHeader>

    <AppDataTable
      :columns="columns"
      :rows="formattedSales"
      :loading="loading"
      :filter="filter"
      title="Lista de Ventas"
      @update:filter="filter = $event"
      @row-click="(_, row) => viewSale(row)"
    >
      <template #item-actions="{ row }">
        <q-btn icon="visibility" size="sm" flat round color="info" @click.stop="viewSale(row)">
          <q-tooltip>Ver detalles</q-tooltip>
        </q-btn>
      </template>
    </AppDataTable>

    <q-dialog v-model="showDetail" :maximized="$q.screen.lt.md">
      <q-card style="width: 700px; max-width: 95vw">
        <q-bar class="bg-primary text-white">
          <q-icon name="receipt_long" />
          <div class="text-subtitle1 q-ml-sm">Detalle de Venta #{{ selectedSale?.id }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section v-if="selectedSale">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey">Fecha</div>
              <div class="text-body1">{{ formatDate(selectedSale.sale_date) }}</div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey">Total</div>
              <div class="text-h6 text-green-8">S/ {{ Number(selectedSale.total).toFixed(2) }}</div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey">Cliente</div>
              <div class="text-body1">{{ selectedSale.customer_name || selectedSale.client_name || 'Anónimo' }}</div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey">Documento</div>
              <div class="text-body1">{{ selectedSale.document_type_name || '-' }} {{ selectedSale.document_number || '' }}</div>
            </div>
          </div>
          <q-separator class="q-mb-md" />
          <div class="text-subtitle2 q-mb-sm">Productos</div>
          <q-list dense separator v-if="selectedSale.details">
            <q-item v-for="detail in selectedSale.details" :key="detail.id">
              <q-item-section>
                <q-item-label>{{ detail.product?.name || `Producto #${detail.product_id}` }}</q-item-label>
                <q-item-label caption>{{ detail.quantity }} x S/ {{ Number(detail.price).toFixed(2) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                S/ {{ Number(detail.subtotal).toFixed(2) }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppDataTable from '@components/shared/AppDataTable.vue';
import { resources } from './api-resource/ApiResource';
import { useFetchHttp } from '@composables/useFetchHttp';

const { fetchHttpResource } = useFetchHttp();
const $q = useQuasar();

interface Sale {
  id: number;
  sale_date: string;
  total: number;
  client_id: number | null;
  client_name: string | null;
  customer_name: string | null;
  document_type_name: string | null;
  document_number: string | null;
  active: boolean;
  details?: SaleDetail[];
}

interface SaleDetail {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product?: { name: string };
}

const sales = ref<Sale[]>([]);
const loading = ref(false);
const filter = ref('');
const showDetail = ref(false);
const selectedSale = ref<Sale | null>(null);

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const, sortable: true },
  { name: 'sale_date', label: 'Fecha', field: 'sale_date', align: 'left' as const, sortable: true },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const, sortable: true },
  { name: 'customer', label: 'Cliente', field: 'customer', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'center' as const },
];

const formattedSales = computed(() =>
  sales.value.map((s) => ({
    ...s,
    total: `S/ ${Number(s.total).toFixed(2)}`,
    customer: s.customer_name || s.client_name || 'Anónimo',
    status: s.active ? 'Activa' : 'Anulada',
    sale_date: formatDate(s.sale_date),
  })),
)

function formatDate(date: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

async function loadSales() {
  loading.value = true;
  try {
    const response = await fetchHttpResource<{ data: Sale[] }>(resources.allSales());
    if (response.success && Array.isArray(response.data)) {
      sales.value = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
    } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      sales.value = (response.data as any).data;
    } else {
      sales.value = Array.isArray(response.data) ? response.data : [];
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar ventas' });
  } finally {
    loading.value = false;
  }
}

async function viewSale(row: { id: number } & Record<string, unknown>) {
  loading.value = true;
  try {
    const response = await fetchHttpResource<Sale>(resources.showSale(row.id));
    if (response.success) {
      selectedSale.value = response.data;
    } else {
      selectedSale.value = row as unknown as Sale;
    }
    showDetail.value = true;
  } catch {
    selectedSale.value = row as unknown as Sale;
    showDetail.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadSales();
});
</script>
