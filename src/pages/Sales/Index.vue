<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';
import AppStatusBadge from '@components/shared/AppStatusBadge.vue';
import { useSales } from './composables/useSales';
import { useFetchHttp } from '@composables/useFetchHttp';
import { invoiceResources } from '@/api-resources/invoiceResource';
import type { ISale } from './interfaces/ISale';

defineOptions({ name: 'SalesPage' });

const { sales, loading, filter, pagination, loadSales } = useSales();
const { fetchHttpResource } = useFetchHttp();
const dateFrom = ref('');
const dateTo = ref('');

async function downloadInvoice(saleId: number | string) {
  await fetchHttpResource(invoiceResources.saleInvoice(saleId));
}

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
    field: (row: ISale) => row.total,
    align: 'right' as const,
  },
  {
    name: 'status',
    label: 'Estado',
    field: (row: ISale) => row.active,
    align: 'center' as const,
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: (row: ISale) => row.id,
    align: 'center' as const,
  },
];

onMounted(async () => {
  await loadSales();
});

const getInitials = (name: string | undefined | null) => {
  if (!name || name === 'Anónimo') return 'A';
  return name.charAt(0).toUpperCase();
};
</script>

<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Ventas" subtitle="Historial de transacciones de venta">
      <template #actions>
        <q-btn
          class="pharma-btn-main"
          icon="add"
          label="Nueva Venta"
          unelevated
          :to="{ path: '/sales/new' }"
        />
        <q-btn icon="refresh" flat round @click="loadSales()" :loading="loading" />
      </template>
    </AppPageHeader>

    <q-card class="pharma-card q-mt-md" flat bordered>
      <q-card-section>
        <div class="row q-gutter-sm items-end">
          <q-input
            v-model="filter"
            label="Buscar por cliente/código"
            outlined
            dense
            clearable
            debounce="400"
            class="col-12 col-sm-4 pharma-input-inset"
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
            class="col-12 col-sm-3 pharma-input-inset"
            @update:model-value="onDateFilter"
          />
          <q-input
            v-model="dateTo"
            outlined
            dense
            label="Hasta"
            type="date"
            class="col-12 col-sm-3 pharma-input-inset"
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
        class="bg-transparent"
        @request="onTableRequest"
      >
        <template #body-cell-id="props">
          <q-td :props="props" class="text-grey-7">
            #{{ props.row.id }}
          </q-td>
        </template>
        
        <template #body-cell-sale_date="props">
          <q-td :props="props">
            <q-chip outline color="primary" class="bg-grey-1" size="sm" dense>
              {{ props.row.sale_date?.slice(0, 10) ?? '-' }}
            </q-chip>
          </q-td>
        </template>
        
        <template #body-cell-client_name="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="sm" color="teal" text-color="white" class="q-mr-sm">
                {{ getInitials(props.row.client_name || props.row.customer_name) }}
              </q-avatar>
              <span class="text-weight-bold">{{ props.row.client_name || props.row.customer_name || 'Anónimo' }}</span>
            </div>
          </q-td>
        </template>
        
        <template #body-cell-total="props">
          <q-td :props="props" class="text-weight-bold text-teal">
            S/ {{ Number(props.row.total).toFixed(2) }}
          </q-td>
        </template>
        
        <template #body-cell-status="props">
          <q-td :props="props">
            <AppStatusBadge :status="props.row.active ? 'active' : 'inactive'" :label="props.row.active ? 'Activa' : 'Anulada'" />
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
              @click="downloadInvoice(props.row.id)"
            >
              <q-tooltip>Descargar Comprobante PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        
        <template #no-data>
          <div class="full-width row flex-center q-pa-md">
            <AppEmptyState
              icon="receipt_long"
              title="Sin ventas registradas"
              description="No se encontraron transacciones en el periodo o con los filtros seleccionados"
            >
              <template #actions>
                <q-btn
                  class="pharma-btn-main"
                  icon="add"
                  label="Nueva Venta"
                  unelevated
                  :to="{ path: '/sales/new' }"
                />
              </template>
            </AppEmptyState>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>
