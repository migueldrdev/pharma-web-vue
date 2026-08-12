<script setup lang="ts">
import AppStatusBadge from '@components/shared/AppStatusBadge.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';

defineProps<{
  sales: Array<{ id: number; client: string; total: number; date: string; status: string }>;
  loading?: boolean;
}>();

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left' as const },
  { name: 'client', label: 'Cliente', field: 'client', align: 'left' as const },
  { name: 'date', label: 'Fecha', field: 'date', align: 'left' as const },
  { name: 'total', label: 'Total', field: 'total', align: 'right' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' as const },
];
</script>

<template>
  <q-card class="pharma-card" flat bordered>
    <q-card-section class="row items-center no-wrap">
      <q-icon name="receipt_long" color="primary" size="sm" />
      <span class="text-subtitle1 text-weight-bold q-ml-sm">Últimas Ventas</span>
      <q-space />
      <q-btn flat no-caps color="primary" label="Ver todas" size="sm" :to="{ path: '/sales' }" />
    </q-card-section>
    
    <q-table
      :rows="sales"
      :columns="columns"
      row-key="id"
      class="bg-transparent"
      flat
      hide-pagination
      :rows-per-page-options="[0]"
      :loading="loading"
      dense
    >
      <template #body-cell-client="{ row }">
        <q-td>
          <div class="row items-center no-wrap">
            <q-avatar size="sm" color="grey-2" text-color="grey-8" class="q-mr-sm">
              <q-icon name="mdi-account-outline" size="xs" />
            </q-avatar>
            <span class="text-weight-bold">{{ row.client }}</span>
          </div>
        </q-td>
      </template>
      
      <template #body-cell-date="{ row }">
        <q-td>
          <q-chip outline size="sm" color="grey-7" class="q-ma-none">
            {{ row.date }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-total="{ row }">
        <q-td class="text-right">
          <span class="text-weight-bold text-primary">S/ {{ row.total.toFixed(2) }}</span>
        </q-td>
      </template>

      <template #body-cell-status="{ row }">
        <q-td class="text-center">
          <AppStatusBadge :status="row.status === 'activo' ? 'active' : 'inactive'" />
        </q-td>
      </template>
      
      <template #no-data>
        <AppEmptyState 
          icon="receipt_long" 
          title="Sin ventas registradas" 
        />
      </template>
    </q-table>
  </q-card>
</template>
