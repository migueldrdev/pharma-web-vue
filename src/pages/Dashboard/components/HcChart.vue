<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import Highcharts from 'highcharts';
import type { Options } from 'highcharts';

const props = defineProps<{
  options: Options;
}>();

const container = ref<HTMLElement | null>(null);
let chart: Highcharts.Chart | null = null;

onMounted(() => {
  if (container.value) {
    chart = Highcharts.chart(container.value, props.options);
  }
});

watch(
  () => props.options,
  (newOpts) => {
    if (chart) {
      chart.update(newOpts, true);
    }
  },
  { deep: true },
);

onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});
</script>

<template>
  <div ref="container" class="hc-chart" />
</template>

<style scoped>
.hc-chart {
  width: 100%;
}
</style>
