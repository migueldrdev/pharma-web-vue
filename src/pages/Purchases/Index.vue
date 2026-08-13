<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import { usePurchases } from './composables/usePurchases';
import { useFetchHttp } from '@composables/useFetchHttp';
import { invoiceResources } from '@/api-resources/invoiceResource';

defineOptions({ name: 'PurchasesPage' });

const router = useRouter();
const { purchases, loading, filter, pagination, loadPurchases } = usePurchases();
const { fetchHttpResource } = useFetchHttp();

async function downloadReceipt(purchaseId: number | string) {
  await fetchHttpResource(invoiceResources.purchaseReceipt(purchaseId));
}

async function onTableRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  await loadPurchases();
}

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'purchase_date', label: 'Fecha', field: 'purchase_date', align: 'left' as const },
  { name: 'supplier_name', label: 'Proveedor', field: 'supplier_name', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'center' as const },
];

onMounted(async () => {
  await loadPurchases();
});

function goToNewPurchase() {
  void router.push('/purchases/new');
}
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Compras" subtitle="Historial de compras a proveedores">
      <template #actions>
        <q-btn
          class="pharma-btn-main"
          color="primary"
          icon="add"
          label="Nueva Compra"
          unelevated
          @click="goToNewPurchase"
        />
        <q-btn icon="refresh" flat round @click="loadPurchases()" :loading="loading" />
      </template>
    </AppPageHeader>

    <q-card class="pharma-card" flat>
      <q-card-section>
        <q-input
          v-model="filter"
          label="Buscar por proveedor"
          class="pharma-input-inset q-mb-md"
          outlined
          dense
          clearable
          debounce="400"
          @update:model-value="
            pagination.page = 1;
            loadPurchases();
          "
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>

      <q-table
        :rows="purchases"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :rows-per-page-options="[10, 25, 50]"
        class="bg-transparent"
        flat
        @request="onTableRequest"
      >
        <template #body-cell-purchase_date="props">
          <q-td :props="props">
            <q-chip outline color="grey-8" size="sm" class="text-weight-medium">
              {{ props.row.purchase_date?.slice(0, 10) ?? '-' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-supplier_name="props">
          <q-td :props="props">
            <q-icon name="mdi-truck-delivery-outline" size="xs" color="grey-7" class="q-mr-xs" />
            {{ props.row.supplier_name }}
          </q-td>
        </template>

        <template #body-cell-total="props">
          <q-td :props="props" class="text-weight-bold text-primary">
            S/ {{ Number(props.row.total).toFixed(2) }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="picture_as_pdf"
              @click="downloadReceipt(props.row.id)"
            >
              <q-tooltip>Descargar Recibo PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-md">
            <AppEmptyState
              icon="mdi-cart-arrow-down"
              title="Sin compras registradas"
              description="No se encontraron compras en el sistema o con los filtros aplicados"
            >
              <template #actions>
                <q-btn
                  class="pharma-btn-main"
                  color="primary"
                  icon="add"
                  label="Nueva Compra"
                  unelevated
                  @click="goToNewPurchase"
                />
              </template>
            </AppEmptyState>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>
