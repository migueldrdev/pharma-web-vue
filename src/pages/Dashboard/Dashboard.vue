<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <div class="row items-center q-mb-md">
      <div class="col">
        <h1 class="text-h5 q-ma-none">Dashboard</h1>
        <p class="text-caption text-grey-7 q-ma-none">Panel de control principal</p>
      </div>
      <div class="col-auto">
        <q-btn round flat icon="refresh" color="primary" :loading="loading" @click="refreshData" />
      </div>
    </div>

    <KpiGrid :kpis="kpis" :loading="loading" class="q-mb-lg" />

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-md-6">
        <SalesChart :data="[...salesTrend]" :categories="['Sem 1','Sem 2','Sem 3','Sem 4']" :loading="loading" />
      </div>
      <div class="col-12 col-md-6">
        <TopProductsChart :data="topProductsNames" :loading="loading" />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-md-6">
        <InventoryPieChart :data="topProductsNames" :loading="loading" />
      </div>
      <div class="col-12 col-md-6">
        <CashFlowChart
          :income-data="salesTrend"
          :expense-data="salesTrend.map((d) => d * 0.3)"
          :categories="['Sem 1','Sem 2','Sem 3','Sem 4']"
          :loading="loading"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-md-6">
        <RecentSalesTable :sales="recentSales" :loading="loading" />
      </div>
      <div class="col-12 col-md-6">
        <LowStockTable :products="lowStockProducts" :loading="loading" />
      </div>
    </div>

    <QuickActions />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import KpiGrid from './components/KpiGrid.vue';
import SalesChart from './components/SalesChart.vue';
import TopProductsChart from './components/TopProductsChart.vue';
import InventoryPieChart from './components/InventoryPieChart.vue';
import CashFlowChart from './components/CashFlowChart.vue';
import RecentSalesTable from './components/RecentSalesTable.vue';
import LowStockTable from './components/LowStockTable.vue';
import QuickActions from './components/QuickActions.vue';
import { useDashboard } from './composables/useDashboard';

defineOptions({ name: 'DashboardPage' });

const {
  loading, kpis, recentSales, lowStockProducts,
  salesTrend, topProductsNames, refreshData,
} = useDashboard();

onMounted(() => {
  void refreshData();
});
</script>
