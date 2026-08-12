<script setup lang="ts">
import { computed } from 'vue';
import { baseChartOptions } from '../charts/chartOptions';
import HcChart from './HcChart.vue';
import type { SeriesOptionsType } from 'highcharts';
import type { ITopProductItem } from '../interfaces/IDashboard';

const props = defineProps<{
  data: ITopProductItem[];
  loading?: boolean;
}>();

const hasData = computed(() => props.data.length > 0);

const chartOptions = computed(() => ({
  ...baseChartOptions(280),
  title: { text: '' },
  chart: { ...baseChartOptions(280).chart, type: 'bar' },
  xAxis: {
    categories: props.data.map((p) => p.name),
    labels: {
      style: { fontSize: '11px' },
    },
  },
  yAxis: {
    title: { text: 'Unidades vendidas' },
    allowDecimals: false,
  },
  colors: ['#FF9500'],
  series: [
    {
      name: 'Vendidos',
      type: 'bar',
      data: props.data.map((p) => p.units_sold),
      dataLabels: { enabled: true, format: '{y} uds.' },
    },
  ] as SeriesOptionsType[],
  tooltip: {
    pointFormatter: function (this: Highcharts.Point) {
      const item = props.data[this.index ?? 0];
      return `<b>${item?.units_sold ?? 0} unidades</b><br/>Ingreso: S/ ${(item?.revenue ?? 0).toFixed(2)}`;
    },
  },
  accessibility: { enabled: false },
}));
</script>

<template>
  <q-card flat bordered class="chart-card">
    <q-card-section class="row items-center no-wrap">
      <q-icon name="local_fire_department" color="orange" size="sm" />
      <span class="text-subtitle2 q-ml-sm">Top 5 Productos Más Vendidos</span>
    </q-card-section>
    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 280px">
        <q-spinner color="orange" size="40px" />
      </div>
      <div v-else-if="!hasData" class="flex flex-center text-grey-6" style="height: 280px">
        Sin datos disponibles
      </div>
      <HcChart v-else :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>
