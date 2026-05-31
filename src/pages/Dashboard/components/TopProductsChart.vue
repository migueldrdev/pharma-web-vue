<script setup lang="ts">
import { computed } from 'vue';
import { baseChartOptions, barChartSeries } from '../charts/chartOptions';

const props = defineProps<{
  data: Array<[string, number]>;
  loading?: boolean;
}>();

const hasData = computed(() => props.data.length > 0);

const chartOptions = computed(() => ({
  ...baseChartOptions(280),
  chart: { ...baseChartOptions(280).chart, type: 'bar' },
  xAxis: { categories: props.data.map(([name]) => name) },
  yAxis: { title: { text: 'Unidades' } },
  colors: ['#FF9500'],
  series: barChartSeries('Vendidos', props.data.map(([, count]) => count)),
  accessibility: { enabled: false },
}));
</script>

<template>
  <q-card flat bordered class="chart-card">
    <q-card-section class="row items-center no-wrap">
      <q-icon name="medication" color="accent" size="sm" />
      <span class="text-subtitle2 q-ml-sm">Productos por Categoría</span>
    </q-card-section>
    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 280px">
        <q-spinner color="accent" size="40px" />
      </div>
      <div v-else-if="!hasData" class="flex flex-center text-grey-6" style="height: 280px">
        Sin datos disponibles
      </div>
      <highcharts v-else :key="data.join()" :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>
