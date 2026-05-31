<script setup lang="ts">
import { computed } from 'vue';
import { baseChartOptions, columnChartSeries } from '../charts/chartOptions';

const props = defineProps<{
  incomeData: number[];
  expenseData: number[];
  categories: string[];
  loading?: boolean;
}>();

const hasData = computed(() => props.incomeData.length > 0);

const chartOptions = computed(() => ({
  ...baseChartOptions(280),
  chart: { ...baseChartOptions(280).chart, type: 'column' },
  xAxis: { categories: props.categories },
  yAxis: { title: { text: 'Monto (S/)' } },
  colors: ['#52C41A', '#FF4D4F'],
  series: columnChartSeries(props.incomeData, props.expenseData),
  accessibility: { enabled: false },
}));
</script>

<template>
  <q-card flat bordered class="chart-card">
    <q-card-section class="row items-center no-wrap">
      <q-icon name="account_balance_wallet" color="positive" size="sm" />
      <span class="text-subtitle2 q-ml-sm">Flujo de Caja Semanal</span>
    </q-card-section>
    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 280px">
        <q-spinner color="positive" size="40px" />
      </div>
      <div v-else-if="!hasData" class="flex flex-center text-grey-6" style="height: 280px">
        Sin datos disponibles
      </div>
      <highcharts v-else :key="incomeData.join()" :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>
