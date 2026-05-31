<script setup lang="ts">
import AppStatusChip from '@components/shared/AppStatusChip.vue';

defineProps<{
  sales: Array<{ id: number; client: string; total: number; date: string; status: string }>;
  loading?: boolean;
}>();

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'client', label: 'Cliente', field: 'client', align: 'left' as const },
  { name: 'date', label: 'Fecha', field: 'date', align: 'left' as const },
  { name: 'total', label: 'Total', field: (row: { total: number }) => `S/ ${row.total.toFixed(2)}`, align: 'right' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
];
</script>

<template>
  <q-card flat bordered>
    <q-card-section class="row items-center no-wrap">
      <q-icon name="receipt_long" color="primary" size="sm" />
      <span class="text-subtitle2 q-ml-sm">Últimas Ventas</span>
      <q-space />
      <q-btn flat no-caps color="primary" label="Ver todas" size="sm" :to="{ path: '/sales' }" />
    </q-card-section>
    <q-card-section>
      <q-table
        :rows="sales"
        :columns="columns"
        row-key="id"
        flat
        hide-pagination
        :rows-per-page-options="[0]"
        :loading="loading"
        dense
      >
        <template #body-cell-status="{ value }">
          <q-td>
            <AppStatusChip :status="value === 'activo' ? 'active' : 'inactive'" size="xs" />
          </q-td>
        </template>
        <template #no-data>
          <div class="text-grey-6 q-py-md text-center">Sin ventas registradas</div>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>
