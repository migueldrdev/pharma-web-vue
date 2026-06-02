<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { useSales } from './composables/useSales';
import type { ISale } from './interfaces/ISale';

defineOptions({ name: 'SalesPage' });

const { sales, loading, filter, pagination, loadSales } = useSales();
const dateFrom = ref('');
const dateTo = ref('');

async function onDateFilter() {
  pagination.value.page = 1;
  const params: Record<string, unknown> = {};
  if (dateFrom.value) params.from = dateFrom.value;
  if (dateTo.value) params.to = dateTo.value;
  await loadSales(params);
}

async function onTableRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  await loadSales();
}

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const, sortable: true },
  {
    name: 'sale_date',
    label: 'Fecha',
    field: (row: ISale) => row.sale_date?.slice(0, 10) ?? '-',
    align: 'left' as const,
  },
  {
    name: 'client_name',
    label: 'Cliente',
    field: (row: ISale) => row.client_name || row.customer_name || 'Anónimo',
    align: 'left' as const,
  },
  {
    name: 'total',
    label: 'Total',
    field: (row: ISale) => `S/ ${Number(row.total).toFixed(2)}`,
    align: 'right' as const,
  },
  {
    name: 'status',
    label: 'Estado',
    field: (row: ISale) => (row.active ? 'Activa' : 'Anulada'),
    align: 'center' as const,
  },
];

onMounted(async () => {
  await loadSales();
});
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Ventas" subtitle="Historial de transacciones">
      <template #actions>
        <q-btn
          color="primary"
          icon="add"
          label="Nueva Venta"
          unelevated
          :to="{ path: '/sales/new' }"
        />
        <q-btn icon="refresh" flat round @click="loadSales()" :loading="loading" />
      </template>
    </AppPageHeader>

    <q-card flat bordered>
      <q-card-section>
        <div class="row q-gutter-sm items-end q-mb-md">
          <q-input
            v-model="filter"
            label="Buscar"
            outlined
            dense
            clearable
            debounce="400"
            class="col-12 col-sm-4"
            @update:model-value="
              pagination.page = 1;
              loadSales();
            "
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <q-space />
          <q-input
            v-model="dateFrom"
            outlined
            dense
            label="Desde"
            type="date"
            class="col-12 col-sm-3"
            @update:model-value="onDateFilter"
          />
          <q-input
            v-model="dateTo"
            outlined
            dense
            label="Hasta"
            type="date"
            class="col-12 col-sm-3"
            @update:model-value="onDateFilter"
          />
        </div>
      </q-card-section>

      <q-table
        :rows="sales"
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
            <q-icon name="receipt_long" size="48px" />
            <div class="text-subtitle1 q-mt-sm">Sin ventas registradas</div>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>
