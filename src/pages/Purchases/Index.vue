<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import ExportButtons from '@components/ExportButtons.vue';
import { usePurchases } from './composables/usePurchases';
import type { IPurchase } from './interfaces/IPurchase';

defineOptions({ name: 'PurchasesPage' });

const { purchases, loading, filter, pagination, loadPurchases } = usePurchases();

async function onTableRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  await loadPurchases();
}

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  {
    name: 'purchase_date',
    label: 'Fecha',
    field: (row: IPurchase) => row.purchase_date?.slice(0, 10) ?? '-',
    align: 'left' as const,
  },
  { name: 'supplier_name', label: 'Proveedor', field: 'supplier_name', align: 'left' as const },
  {
    name: 'total',
    label: 'Total',
    field: (row: IPurchase) => `S/ ${Number(row.total).toFixed(2)}`,
    align: 'right' as const,
  },
];

// Transform purchases data for export
const exportData = computed(() => {
  return purchases.value.map((purchase: IPurchase) => ({
    ID: purchase.id,
    Fecha: purchase.purchase_date?.slice(0, 10) ?? '-',
    Proveedor: purchase.supplier_name || '-',
    Total: Number(purchase.total).toFixed(2),
  }));
});

onMounted(async () => {
  await loadPurchases();
});
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Compras" subtitle="Historial de compras">
      <template #actions>
        <q-btn
          color="primary"
          icon="add"
          label="Nueva Compra"
          unelevated
          :to="{ path: '/purchases/new' }"
        />
        <q-btn icon="refresh" flat round @click="loadPurchases()" :loading="loading" />
      </template>
    </AppPageHeader>

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-gutter-md items-center q-mb-md">
          <ExportButtons
            :data="exportData"
            filename="compras"
            sheet-name="Compras"
            show-pdf-export
            pdf-export-type="purchases"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="filter"
          label="Buscar por proveedor"
          outlined
          dense
          clearable
          debounce="400"
          class="q-mb-md"
          @update:model-value="
            pagination.page = 1;
            loadPurchases();
          "
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </q-card-section>
      <q-table
        :rows="purchases"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :rows-per-page-options="[10, 25, 50]"
        flat
        @request="onTableRequest"
      >
        <template #no-data>
          <div class="text-center q-py-lg text-grey-6">
            <q-icon name="shopping_cart" size="48px" />
            <div class="text-subtitle1 q-mt-sm">Sin compras registradas</div>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>
