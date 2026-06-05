<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Reporte de Inventario" subtitle="Resumen del estado actual del inventario">
      <template #actions>
        <q-btn label="Exportar Excel" icon="table_view" color="green" rounded flat
          :loading="exporting" @click="handleExport" />
      </template>
    </AppPageHeader>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section>
          <div class="text-caption text-grey">Total Productos</div>
          <div class="text-h4 text-primary">{{ summary.total_products ?? 0 }}</div>
        </q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section>
          <div class="text-caption text-grey">Stock Total</div>
          <div class="text-h4 text-positive">{{ summary.total_stock ?? 0 }}</div>
        </q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section>
          <div class="text-caption text-grey">Stock Bajo</div>
          <div class="text-h4 text-warning">{{ summary.low_stock_count ?? 0 }}</div>
        </q-card-section></q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered><q-card-section>
          <div class="text-caption text-grey">Valor Inventario</div>
          <div class="text-h4 text-green-8">S/ {{ (summary.total_value ?? 0).toFixed(2) }}</div>
        </q-card-section></q-card>
      </div>
    </div>

    <q-card flat bordered class="q-mt-md q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">Stock por Categoría</div>
        <highchart :options="pieChartOptions" />
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">Productos con Stock Bajo</div>
        <q-table :rows="lowStockProducts" :columns="columns" :loading="loading" row-key="id" flat dense>
          <template #body-cell-stock="props">
            <q-td :props="props">
              <q-chip :color="Number(props.value) <= 5 ? 'negative' : 'warning'" text-color="white" size="sm">
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-cost_price="props">
            <q-td :props="props">S/ {{ Number(props.value).toFixed(2) }}</q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppPageHeader from '@components/shared/AppPageHeader.vue'
import { useFetchHttp } from '@composables/useFetchHttp'
import { useNotify } from '@composables/useNotify'
import { useExcelExport } from '@composables/useExcelExport'
import { reportResources } from '@/api-resources/reportResource'

defineOptions({ name: 'ReportsInventoryIndex' })

const { fetchHttpResource } = useFetchHttp()
const { success } = useNotify()
const { exportToExcel } = useExcelExport()

const loading = ref<boolean>(false)
const exporting = ref<boolean>(false)
const summary = ref<Record<string, number>>({})
const lowStockProducts = ref<Record<string, unknown>[]>([])
const stockByCategory = ref<{ id: number; name: string; total_stock: number; total_value: number }[]>([])

const columns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center' as const },
  { name: 'min_stock', label: 'Mínimo', field: 'min_stock', align: 'center' as const },
  { name: 'cost_price', label: 'Costo', field: 'cost_price', align: 'right' as const },
]

const pieChartOptions = computed(() => ({
  chart: { type: 'pie', height: 300 },
  title: { text: '' },
  series: [{
    name: 'Stock',
    data: stockByCategory.value.map((c) => ({ name: c.name, y: c.total_stock })),
  }],
  credits: { enabled: false },
}))

async function loadData(): Promise<void> {
  loading.value = true
  const res = await fetchHttpResource<Record<string, unknown>>(reportResources.inventory())
  if (res.success) {
    const data = res.data
    summary.value = (data.summary ?? {}) as Record<string, number>
    lowStockProducts.value = (data.low_stock_products ?? []) as Record<string, unknown>[]
    stockByCategory.value = (data.stock_by_category ?? []) as { id: number; name: string; total_stock: number; total_value: number }[]
  }
  loading.value = false
}

async function handleExport(): Promise<void> {
  exporting.value = true
  await exportToExcel({
    filename: 'reporte-inventario',
    sheetName: 'Stock Bajo',
    columns: [
      { header: 'Producto', key: 'name', width: 30 },
      { header: 'Stock', key: 'stock', width: 10, align: 'center' },
      { header: 'Mínimo', key: 'min_stock', width: 10, align: 'center' },
      { header: 'Costo', key: 'cost_price', width: 14, numFmt: '#,##0.00', align: 'right' },
    ],
    data: lowStockProducts.value,
    title: 'Reporte de Inventario - Stock Bajo',
  })
  success('Reporte exportado exitosamente')
  exporting.value = false
}

onMounted(loadData)
</script>
