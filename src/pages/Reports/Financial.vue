<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Reporte Financiero" subtitle="Resumen de ingresos, costos y rentabilidad">
      <template #actions>
        <q-btn label="Exportar Excel" icon="table_view" color="green" rounded flat
          :loading="exporting" @click="handleExport" />
      </template>
    </AppPageHeader>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-md-4 col-sm-6 col-xs-12">
        <AppKpiCard
          title="Ingresos"
          :value="(summary.total_revenue ?? 0).toFixed(2)"
          prefix="S/ "
          icon="attach_money"
          color="positive"
          :loading="loading"
        />
      </div>
      <div class="col-md-4 col-sm-6 col-xs-12">
        <AppKpiCard
          title="Utilidad Bruta"
          :value="(summary.gross_profit ?? 0).toFixed(2)"
          prefix="S/ "
          icon="account_balance_wallet"
          color="positive"
          :loading="loading"
        />
      </div>
      <div class="col-md-4 col-sm-6 col-xs-12">
        <AppKpiCard
          title="Margen"
          :value="(summary.profit_margin ?? 0).toFixed(1)"
          suffix="%"
          icon="percent"
          color="accent"
          :loading="loading"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-md-4 col-sm-6 col-xs-12">
        <AppKpiCard
          title="Costo de Ventas"
          :value="(summary.cost_of_goods_sold ?? 0).toFixed(2)"
          prefix="S/ "
          icon="money_off"
          color="warning"
          :loading="loading"
        />
      </div>
      <div class="col-md-4 col-sm-6 col-xs-12">
        <AppKpiCard
          title="Compras"
          :value="(summary.total_purchases ?? 0).toFixed(2)"
          prefix="S/ "
          icon="shopping_cart"
          color="info"
          :loading="loading"
        />
      </div>
      <div class="col-md-4 col-sm-6 col-xs-12">
        <AppKpiCard
          title="Utilidad Neta"
          :value="(summary.net_profit ?? 0).toFixed(2)"
          prefix="S/ "
          icon="savings"
          color="primary"
          :loading="loading"
        />
      </div>
    </div>

    <q-card flat bordered class="q-mb-md pharma-card">
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">Ingresos Diarios</div>
        <highchart :options="lineChartOptions" />
      </q-card-section>
    </q-card>

    <q-card flat bordered class="pharma-card">
      <q-card-section>
        <div class="text-subtitle1 text-primary q-mb-md">Productos Más Rentables</div>
        <q-table :rows="profitableProducts" :columns="prodColumns" :loading="loading" row-key="id" flat class="bg-transparent" dense>
          <template #body-cell-revenue="p"><q-td :props="p" class="text-teal text-weight-bold">S/ {{ Number(p.value).toFixed(2) }}</q-td></template>
          <template #body-cell-margin="p">
            <q-td :props="p">
              <AppStatusBadge
                :status="Number(p.value) > 30 ? 'active' : 'warning'"
                :label="`${Number(p.value).toFixed(1)}%`"
              />
            </q-td>
          </template>
          <template #no-data>
            <div class="full-width row flex-center q-pa-md">
              <AppEmptyState title="No hay datos financieros" description="No se encontraron registros de rentabilidad." icon="analytics" />
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppPageHeader from '@components/shared/AppPageHeader.vue'
import AppKpiCard from '@components/shared/AppKpiCard.vue'
import AppEmptyState from '@components/shared/AppEmptyState.vue'
import AppStatusBadge from '@components/shared/AppStatusBadge.vue'
import { useFetchHttp } from '@composables/useFetchHttp'
import { useNotify } from '@composables/useNotify'
import { useExcelExport } from '@composables/useExcelExport'
import { reportResources } from '@/api-resources/reportResource'

defineOptions({ name: 'ReportsFinancialIndex' })

const { fetchHttpResource } = useFetchHttp()
const { success } = useNotify()
const { exportToExcel } = useExcelExport()

const loading = ref<boolean>(false)
const exporting = ref<boolean>(false)
const summary = ref<Record<string, number>>({})
const profitableProducts = ref<Record<string, unknown>[]>([])
const dailyRevenue = ref<{ date: string; revenue: number; sales_count: number }[]>([])

const prodColumns = [
  { name: 'name', label: 'Producto', field: 'name', align: 'left' as const },
  { name: 'revenue', label: 'Ingresos', field: 'revenue', align: 'right' as const },
  { name: 'profit', label: 'Utilidad', field: 'profit', align: 'right' as const },
  { name: 'margin', label: 'Margen', field: 'margin', align: 'center' as const },
]

const lineChartOptions = computed(() => ({
  chart: { type: 'column', height: 300 },
  title: { text: '' },
  xAxis: { categories: dailyRevenue.value.map((d) => d.date?.slice(0, 10) ?? '') },
  yAxis: { title: { text: 'S/' } },
  series: [
    { name: 'Ingresos', data: dailyRevenue.value.map((d) => d.revenue), color: '#4caf50' },
  ],
  credits: { enabled: false },
}))

async function loadData(): Promise<void> {
  loading.value = true
  const res = await fetchHttpResource<Record<string, unknown>>(reportResources.financial())
  if (res.success) {
    const data = res.data
    summary.value = (data.summary ?? {}) as Record<string, number>
    profitableProducts.value = (data.top_profitable_products ?? []) as Record<string, unknown>[]
    dailyRevenue.value = (data.daily_revenue ?? []) as { date: string; revenue: number; sales_count: number }[]
  }
  loading.value = false
}

async function handleExport(): Promise<void> {
  exporting.value = true
  await exportToExcel({
    filename: 'reporte-financiero',
    sheetName: 'Rentabilidad',
    columns: [
      { header: 'Producto', key: 'name', width: 30 },
      { header: 'Ingresos', key: 'revenue', width: 16, numFmt: '#,##0.00', align: 'right' },
      { header: 'Utilidad', key: 'profit', width: 16, numFmt: '#,##0.00', align: 'right' },
      { header: 'Margen %', key: 'margin', width: 12, align: 'center' },
    ],
    data: profitableProducts.value,
    title: 'Reporte Financiero - Productos Más Rentables',
    footerSummary: (data: Record<string, unknown>[]) => ({
      name: 'TOTAL',
      revenue: data.reduce((s, r) => s + (Number(r.revenue) || 0), 0),
      profit: data.reduce((s, r) => s + (Number(r.profit) || 0), 0),
      margin: '-',
    }),
  })
  success('Reporte exportado exitosamente')
  exporting.value = false
}

onMounted(loadData)
</script>
