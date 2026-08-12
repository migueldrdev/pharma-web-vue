<script setup lang="ts">
import AppStatusBadge from '@components/shared/AppStatusBadge.vue';
import AppEmptyState from '@components/shared/AppEmptyState.vue';

defineProps<{
  products: Array<{ id: number; name: string; code: string; stock: number; min_stock: number; category: string }>;
  loading?: boolean;
}>();

const columns = [
  { name: 'product', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'category', label: 'Categoría', field: 'category', align: 'left' as const },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' as const },
];
</script>

<template>
  <q-card class="pharma-card" flat bordered>
    <q-card-section class="row items-center no-wrap">
      <q-icon name="warning" color="warning" size="sm" />
      <span class="text-subtitle1 text-weight-bold q-ml-sm">Productos con Stock Bajo</span>
      <q-space />
      <q-btn flat no-caps color="warning" label="Reabastecer" size="sm" :to="{ path: '/inventory/products' }" />
    </q-card-section>
    
    <q-table
      :rows="products"
      :columns="columns"
      row-key="id"
      class="bg-transparent"
      flat
      hide-pagination
      :rows-per-page-options="[0]"
      :loading="loading"
      dense
    >
      <template #body-cell-product="{ row }">
        <q-td>
          <div class="row items-center no-wrap">
            <q-icon name="mdi-pill" size="sm" color="grey-6" class="q-mr-sm" />
            <div>
              <div class="text-weight-bold">{{ row.name }}</div>
              <div class="text-caption text-grey-6">{{ row.code }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template #body-cell-stock="{ row }">
        <q-td class="text-center">
          <AppStatusBadge 
            :status="row.stock <= row.min_stock / 2 ? 'critical' : 'warning'" 
            :label="`${row.stock} und.`"
          />
        </q-td>
      </template>
      
      <template #no-data>
        <AppEmptyState 
          icon="check_circle" 
          icon-color="positive"
          title="Stock Saludable" 
          description="No hay productos con stock bajo"
        />
      </template>
    </q-table>
  </q-card>
</template>
