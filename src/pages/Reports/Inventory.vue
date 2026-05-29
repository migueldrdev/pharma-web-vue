<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Reporte de Inventario" subtitle="Resumen del estado actual del inventario" />
    <div class="row q-col-gutter-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section><div class="text-caption text-grey">Total Productos</div><div class="text-h4 text-primary">{{ totalProducts }}</div></q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section><div class="text-caption text-grey">Stock Total</div><div class="text-h4 text-positive">{{ totalStock }}</div></q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section><div class="text-caption text-grey">Stock Bajo</div><div class="text-h4 text-warning">{{ lowStock }}</div></q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section><div class="text-caption text-grey">Valor Inventario</div><div class="text-h4 text-green-8">S/ {{ inventoryValue.toFixed(2) }}</div></q-card-section></q-card>
      </div>
    </div>
    <q-card flat bordered class="q-mt-md"><q-card-section>
      <q-table :rows="items" :columns="columns" :loading="loading" row-key="id" flat dense :rows-per-page-options="[10, 25, 50]">
        <template #body-cell-stock="props"><q-td :props="props"><q-chip :color="Number(props.value) <= 10 ? 'negative' : 'positive'" text-color="white" size="sm">{{ props.value }}</q-chip></q-td></template>
        <template #body-cell-price="props"><q-td :props="props">S/ {{ Number(props.value).toFixed(2) }}</q-td></template>
      </q-table>
    </q-card-section></q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
import { useFetchHttp } from '@composables/useFetchHttp';
import { useQuasar } from 'quasar';

interface Item { id: number; name: string; code: string; stock: number; min_stock: number; price: number; category_name?: string; }
const { fetchHttpResource } = useFetchHttp();
const $q = useQuasar();
const items = ref<Item[]>([]);
const loading = ref(false);
const columns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Código', field: 'code', align: 'left' as const },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' as const },
  { name: 'price', label: 'Precio', field: 'price', align: 'right' as const },
];

const totalProducts = computed(() => items.value.length);
const totalStock = computed(() => items.value.reduce((s, x) => s + (Number(x.stock) || 0), 0));
const lowStock = computed(() => items.value.filter((x) => Number(x.stock) <= Number(x.min_stock)).length);
const inventoryValue = computed(() => items.value.reduce((s, x) => s + (Number(x.stock) || 0) * (Number(x.price) || 0), 0));

onMounted(async () => {
  loading.value = true;
  try {
    const r = await fetchHttpResource({ path: '/product', method: 'get' as never });
    items.value = Array.isArray(r.data) ? r.data as Item[] : (r.data as unknown as { data: Item[] })?.data || [];
  } catch { $q.notify({ type: 'negative', message: 'Error al cargar inventario' }); }
  finally { loading.value = false; }
});
</script>
