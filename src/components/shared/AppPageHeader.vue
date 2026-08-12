<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();

defineSlots<{
  actions(): unknown;
}>();
</script>

<template>
  <div class="app-page-header row items-center justify-between q-mb-lg q-pb-sm">
    <div class="col">
      <h4 class="text-h4 text-weight-bold text-primary q-my-none">{{ title }}</h4>
      <p v-if="subtitle" class="text-subtitle1 text-muted q-mt-xs q-mb-none">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="col-auto">
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-page-header {
  border-bottom: 1px solid var(--border-subtle);
}
</style>
