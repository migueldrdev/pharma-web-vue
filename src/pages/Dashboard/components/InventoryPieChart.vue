<script setup lang="ts">
import { computed } from 'vue';
import { baseChartOptions, pieChartSeries } from '../charts/chartOptions';
import HcChart from './HcChart.vue';

const props = defineProps<{
  data: Array<{ name: string; y: number }>;
  loading?: boolean;
}>();

const hasData = computed(() => props.data.length > 0);

const chartOptions = computed(() => ({
  ...baseChartOptions(280),
  title: { text: '' },
  chart: { ...baseChartOptions(280).chart, type: 'pie' },
  colors: ['#00B4A6', '#FF6B6B', '#FF9500', '#6C5CE7', '#A0D911'],
  series: pieChartSeries(props.data),
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
      <HcChart v-else :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>
