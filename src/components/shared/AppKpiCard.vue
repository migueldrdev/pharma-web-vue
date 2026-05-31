<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'AppKpiCard' });

const props = defineProps<{
  title: string;
  value: number | string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral' | undefined;
  trendValue?: string | undefined;
  color?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  loading?: boolean | undefined;
}>();

const colorClass = computed(() => props.color || 'primary');

const trendIcon = computed(() => {
  if (props.trend === 'up') return 'trending_up';
  if (props.trend === 'down') return 'trending_down';
  return 'remove';
});

const trendColor = computed(() => {
  if (props.trend === 'up') return 'positive';
  if (props.trend === 'down') return 'negative';
  return 'grey-6';
});

const formattedValue = computed(() => {
  if (props.loading) return '...';
  const prefix = props.prefix ?? '';
  const suffix = props.suffix ?? '';
  return `${prefix}${props.value}${suffix}`;
});
</script>

<template>
  <q-card flat bordered class="kpi-card">
    <q-card-section>
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-caption text-grey-7">{{ title }}</div>
          <div class="text-h5 text-weight-bold q-mt-xs">{{ formattedValue }}</div>
          <div v-if="trendValue && !loading" class="row items-center q-mt-xs">
            <q-icon :name="trendIcon" :color="trendColor" size="xs" />
            <span class="text-caption q-ml-xs" :class="trend === 'up' ? 'text-positive' : trend === 'down' ? 'text-negative' : 'text-grey-6'">
              {{ trendValue }}
            </span>
          </div>
        </div>
        <div class="col-auto">
          <q-avatar rounded size="48px" :color="colorClass" text-color="white">
            <q-icon :name="icon" size="sm" />
          </q-avatar>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.kpi-card {
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}
</style>
