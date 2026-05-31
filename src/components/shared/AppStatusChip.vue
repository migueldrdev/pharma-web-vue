<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'AppStatusChip' });

const props = defineProps<{
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock' | 'warning' | 'error' | 'info' | 'success';
  label?: string;
  size?: string;
}>();

const statusConfig = computed(() => {
  const configs = {
    active: { color: 'positive', label: 'Activo', icon: 'check_circle' },
    inactive: { color: 'grey-7', label: 'Inactivo', icon: 'cancel' },
    discontinued: { color: 'orange-7', label: 'Descontinuado', icon: 'block' },
    out_of_stock: { color: 'negative', label: 'Agotado', icon: 'inventory_2' },
    warning: { color: 'warning', label: 'Advertencia', icon: 'warning' },
    error: { color: 'negative', label: 'Error', icon: 'error' },
    info: { color: 'info', label: 'Info', icon: 'info' },
    success: { color: 'positive', label: 'Éxito', icon: 'check_circle' },
  } as const;

  return configs[props.status];
});

const displayLabel = computed(() => props.label ?? statusConfig.value.label);
</script>

<template>
  <q-chip
    :color="statusConfig.color"
    text-color="white"
    :size="size ?? 'sm'"
    :icon="statusConfig.icon"
  >
    {{ displayLabel }}
  </q-chip>
</template>
