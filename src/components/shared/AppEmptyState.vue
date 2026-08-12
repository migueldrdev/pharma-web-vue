<template>
  <div class="app-empty-state column items-center justify-center q-pa-xl text-center">
    <q-icon :name="icon" :size="iconSize" :color="iconColor" class="q-mb-md empty-icon" />
    <div class="text-h6 text-weight-medium text-primary q-mb-xs">{{ title }}</div>
    <div v-if="description" class="text-body2 text-grey-7 max-w-sm q-mb-lg">
      {{ description }}
    </div>
    <slot name="actions">
      <q-btn
        v-if="actionLabel"
        :label="actionLabel"
        :icon="actionIcon"
        color="primary"
        unelevated
        @click="$emit('action')"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  icon?: string;
  iconSize?: string;
  iconColor?: string;
  actionLabel?: string;
  actionIcon?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'No hay datos disponibles',
  description: '',
  icon: 'inbox',
  iconSize: '4em',
  iconColor: 'grey-5',
  actionLabel: '',
  actionIcon: '',
});

defineEmits<{
  (e: 'action'): void;
}>();
</script>

<style lang="scss" scoped>
.app-empty-state {
  min-height: 280px;

  .empty-icon {
    opacity: 0.85;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .max-w-sm {
    max-width: 420px;
  }
}
</style>
