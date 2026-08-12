<script setup lang="ts">
import { computed } from 'vue';
import { baseChartOptions } from '../charts/chartOptions';
import HcChart from './HcChart.vue';
import type { SeriesOptionsType } from 'highcharts';

const props = defineProps<{
  labels: string[];
  salesData: number[];
  expensesData: number[];
  loading?: boolean;
}>();

const hasData = computed(() => props.salesData.length > 0);

const profitData = computed(() =>
  props.salesData.map((sale, i) => {
    const expense = props.expensesData[i] ?? 0;
    return parseFloat((sale - expense).toFixed(2));
  }),
);

const chartOptions = computed(() => ({
  ...baseChartOptions(280),
  title: { text: '' },
  chart: { ...baseChartOptions(280).chart, type: 'column' },
  xAxis: {
    categories: props.labels,
    labels: { style: { fontSize: '11px' } },
  },
  yAxis: {
    title: { text: 'Monto (S/)' },
    labels: { format: 'S/ {value}' },
  },
  colors: ['#52C41A', '#FF4D4F', '#1890FF'],
  series: [
    { name: 'Ingresos', type: 'column', data: props.salesData },
    { name: 'Gastos', type: 'column', data: props.expensesData },
    {
      name: 'Margen',
      type: 'spline',
      data: profitData.value,
      lineWidth: 2,
      marker: { radius: 4, symbol: 'diamond' },
      dataLabels: { enabled: true, format: 'S/ {y}' },
    },
  ] as SeriesOptionsType[],
  legend: { enabled: true },
  tooltip: {
    shared: true,
    pointFormat: '{series.name}: <b>S/ {point.y:.2f}</b><br/>',
  },
  accessibility: { enabled: false },
}));
</script>

<template>
  <q-card flat bordered class="chart-card">
    <q-card-section class="row items-center no-wrap">
      <q-icon name="account_balance_wallet" color="positive" size="sm" />
      <span class="text-subtitle2 q-ml-sm">Margen de Ganancia Semanal</span>
    </q-card-section>
    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 280px">
        <q-spinner color="positive" size="40px" />
      </div>
      <div v-else-if="!hasData" class="flex flex-center text-grey-6" style="height: 280px">
        Sin datos disponibles
      </div>
      <HcChart v-else :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>
