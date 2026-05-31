<script setup lang="ts">
import { computed } from 'vue';
import { baseChartOptions, salesChartSeries } from '../charts/chartOptions';

const props = defineProps<{
  data: number[];
  categories: string[];
  loading?: boolean;
}>();

const hasData = computed(() => props.data.length > 0);

const chartOptions = computed(() => ({
  ...baseChartOptions(280),
  chart: { ...baseChartOptions(280).chart, type: 'line' },
  xAxis: { categories: props.categories },
  yAxis: { title: { text: 'Ventas (S/)' } },
  colors: ['#00B4A6', '#FF6B6B'],
  series: salesChartSeries(props.data, props.data.map((d) => d * 1.2)),
  plotOptions: {
    line: { dataLabels: { enabled: true, format: 'S/ {y}' } },
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
      <highcharts v-else :key="data.join()" :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>
