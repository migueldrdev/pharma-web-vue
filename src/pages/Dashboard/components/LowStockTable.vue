<script setup lang="ts">

defineProps<{
  products: Array<{ id: number; name: string; code: string; stock: number; min_stock: number; category: string }>;
  loading?: boolean;
}>();

const columns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Código', field: 'code', align: 'left' as const },
  { name: 'category', label: 'Categoría', field: 'category', align: 'left' as const },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' as const },
];
</script>

<template>
  <q-card flat bordered>
    <q-card-section class="row items-center no-wrap">
      <q-icon name="warning" color="warning" size="sm" />
      <span class="text-subtitle2 q-ml-sm">Productos con Stock Bajo</span>
      <q-space />
      <q-btn flat no-caps color="warning" label="Reabastecer" size="sm" :to="{ path: '/inventory/products' }" />
    </q-card-section>
    <q-card-section>
      <q-table
        :rows="products"
        :columns="columns"
        row-key="id"
        flat
        hide-pagination
        :rows-per-page-options="[0]"
        :loading="loading"
        dense
      >
        <template #body-cell-stock="{ value }">
          <q-td>
            <div class="row items-center q-gutter-x-sm">
              <q-linear-progress
                :value="Math.min(value / 100, 1)"
                :color="value < 20 ? 'negative' : value < 50 ? 'warning' : 'positive'"
                size="8px"
                rounded
                class="col-6"
              />
              <span class="text-caption">{{ value }} und.</span>
            </div>
          </q-td>
        </template>
        <template #no-data>
          <div class="text-grey-6 q-py-md text-center">Sin productos con stock bajo</div>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>
