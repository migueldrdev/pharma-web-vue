<script setup lang="ts">
import { computed } from 'vue';
import { baseChartOptions } from '../charts/chartOptions';
import HcChart from './HcChart.vue';
import type { SeriesOptionsType } from 'highcharts';

const props = defineProps<{
  labels: string[];
  salesData: number[];
  loading?: boolean;
}>();

const hasData = computed(() => props.salesData.length > 0);

const chartOptions = computed(() => ({
  ...baseChartOptions(280),
  title: { text: '' },
  chart: { ...baseChartOptions(280).chart, type: 'area' },
  xAxis: {
    categories: props.labels,
    labels: { style: { fontSize: '11px' } },
  },
  yAxis: {
    title: { text: 'Ventas (S/)' },
    labels: { format: 'S/ {value}' },
  },
  colors: ['#00B4A6'],
  series: [
    {
      name: 'Ventas',
      type: 'area',
      data: props.salesData,
      lineWidth: 3,
      marker: { radius: 5 },
      fillOpacity: 0.15,
      dataLabels: { enabled: true, format: 'S/ {y}' },
    },
  ] as SeriesOptionsType[],
  plotOptions: {
    area: {
      fillOpacity: 0.15,
    },
  },
  tooltip: {
    pointFormat: '<b>S/ {point.y:.2f}</b>',
  },
  accessibility: { enabled: false },
}));
</script>

<template>
  <q-card flat bordered class="chart-card">
    <q-card-section class="row items-center no-wrap">
      <q-icon name="trending_up" color="primary" size="sm" />
      <span class="text-subtitle2 q-ml-sm">Ventas del Mes</span>
      <q-space />
      <q-btn flat round dense icon="more_vert" size="sm" />
    </q-card-section>
    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 280px">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else-if="!hasData" class="flex flex-center text-grey-6" style="height: 280px">
        Sin datos disponibles
      </div>
      <HcChart v-else :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>
