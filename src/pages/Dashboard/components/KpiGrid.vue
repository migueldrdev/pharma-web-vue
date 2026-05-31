<script setup lang="ts">
import AppKpiCard from '@components/shared/AppKpiCard.vue';
import type { IDashboardKPI } from '../interfaces/IDashboard';

defineProps<{
  kpis: IDashboardKPI[];
  loading?: boolean;
}>();
</script>

<template>
  <div class="row q-col-gutter-md">
    <div
      v-for="kpi in kpis"
      :key="kpi.id"
      class="col-12 col-sm-6 col-md-4 col-lg-3"
    >
      <AppKpiCard
        :title="kpi.title"
        :value="kpi.value"
        :icon="kpi.icon"
        :color="kpi.color"
        :trend="kpi.trend"
        :trend-value="kpi.trend ? kpi.trendValue : undefined"
        :prefix="kpi.prefix"
        :suffix="kpi.suffix"
        :loading="loading"
      />
    </div>
  </div>
</template>
