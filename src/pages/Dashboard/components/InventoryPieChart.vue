<script setup lang="ts">
import { computed } from 'vue';
import { baseChartOptions, pieChartSeries } from '../charts/chartOptions';

const props = defineProps<{
  data: Array<[string, number]>;
  loading?: boolean;
}>();

const hasData = computed(() => props.data.length > 0);

const chartOptions = computed(() => ({
  ...baseChartOptions(280),
  chart: { ...baseChartOptions(280).chart, type: 'pie' },
  colors: ['#00B4A6', '#FF6B6B', '#FF9500', '#6C5CE7', '#A0D911'],
  series: pieChartSeries(props.data.map(([name, y]) => ({ name, y }))),
  accessibility: { enabled: false },
}));
</script>

<template>
  <q-card flat bordered class="chart-card">
    <q-card-section class="row items-center no-wrap">
      <q-icon name="inventory" color="secondary" size="sm" />
      <span class="text-subtitle2 q-ml-sm">Inventario por Categoría</span>
    </q-card-section>
    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 280px">
        <q-spinner color="secondary" size="40px" />
      </div>
      <div v-else-if="!hasData" class="flex flex-center text-grey-6" style="height: 280px">
        Sin datos disponibles
      </div>
      <highcharts v-else :key="data.join()" :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>
