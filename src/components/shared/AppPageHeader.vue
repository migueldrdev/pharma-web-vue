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
  <div class="row items-center justify-between q-mb-md">
    <div class="col">
      <h4 class="q-my-none text-primary">{{ title }}</h4>
      <p v-if="subtitle" class="text-grey-7 q-mt-xs q-mb-none">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="col-auto">
      <slot name="actions" />
    </div>
  </div>
</template>
