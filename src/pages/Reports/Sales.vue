<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Reporte de Ventas" subtitle="Análisis y resumen de ventas realizadas">
      <template #actions>
        <q-btn label="Exportar Excel" icon="table_view" color="green" rounded flat
          :loading="exporting" @click="handleExport" />
      </template>
    </AppPageHeader>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Total Ventas</div>
            <div class="text-h4 text-primary">S/ {{ summary.total_sales?.toFixed(2) ?? '0.00' }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Transacciones</div>
            <div class="text-h4 text-positive">{{ summary.sales_count ?? 0 }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Ticket Promedio</div>
            <div class="text-h4 text-accent">S/ {{ summary.average_ticket?.toFixed(2) ?? '0.00' }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey">Producto Top</div>
            <div class="text-h6 text-warning">{{ topProductName }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">Ventas por Período</div>
        <highchart :options="lineChartOptions" />
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">Top 10 Productos</div>
        <q-table :rows="topProducts" :columns="productColumns" :loading="loading" row-key="id" flat dense>
          <template #body-cell-total_quantity="p">
            <q-td :props="p"><q-badge color="primary" :label="p.value" /></q-td>
          </template>
          <template #body-cell-total_sales="p">
            <q-td :props="p"><span class="text-green-8">S/ {{ Number(p.value).toFixed(2) }}</span></q-td>
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

defineOptions({ name: 'ReportsSalesIndex' })

const { fetchHttpResource } = useFetchHttp()
const { success } = useNotify()
const { exportToExcel } = useExcelExport()

const loading = ref<boolean>(false)
const exporting = ref<boolean>(false)
const summary = ref<Record<string, number>>({})
const topProducts = ref<Record<string, unknown>[]>([])
const salesByPeriod = ref<{ period: string; total: number; count: number }[]>([])

const productColumns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'total_quantity', label: 'Cantidad Vendida', field: 'total_quantity', align: 'center' as const },
  { name: 'total_sales', label: 'Total Ventas', field: 'total_sales', align: 'right' as const },
]

const topProductName = computed<string>(() =>
  (topProducts.value[0]?.name as string) ?? '-',
)

const lineChartOptions = computed(() => ({
  chart: { type: 'spline', height: 300 },
  title: { text: '' },
  xAxis: {
    categories: salesByPeriod.value.map((s) => s.period?.slice(0, 10) ?? ''),
  },
  yAxis: { title: { text: 'S/' } },
  series: [
    { name: 'Ventas', data: salesByPeriod.value.map((s) => s.total), color: '#1976d2' },
  ],
  credits: { enabled: false },
}))

async function loadData(): Promise<void> {
  loading.value = true
  const res = await fetchHttpResource<Record<string, unknown>>(
    reportResources.sales({ period: 'day' }),
  )
  if (res.success) {
    const data = res.data
    summary.value = (data.summary ?? {}) as Record<string, number>
    topProducts.value = (data.top_products ?? []) as Record<string, unknown>[]
    salesByPeriod.value = (data.sales_by_period ?? []) as { period: string; total: number; count: number }[]
  }
  loading.value = false
}

async function handleExport(): Promise<void> {
  exporting.value = true
  await exportToExcel({
    filename: `reporte-ventas`,
    sheetName: 'Ventas',
    columns: [
      { header: 'Producto', key: 'name', width: 30 },
      { header: 'Cantidad Vendida', key: 'total_quantity', width: 16, align: 'center' },
      { header: 'Total Ventas', key: 'total_sales', width: 16, numFmt: '#,##0.00', align: 'right' },
    ],
    data: topProducts.value,
    title: 'Reporte de Ventas - Top Productos',
  })
  success('Reporte exportado exitosamente')
  exporting.value = false
}

onMounted(loadData)
</script>
