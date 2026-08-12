<template>
  <q-badge
    :color="badgeConfig.color"
    :text-color="badgeConfig.textColor"
    :outline="outline"
    class="app-status-badge q-px-sm q-py-xs"
  >
    <q-icon v-if="badgeConfig.icon" :name="badgeConfig.icon" size="14px" class="q-mr-xs" />
    <span>{{ label || badgeConfig.label }}</span>
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'success'
  | 'warning'
  | 'error'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

interface Props {
  status?: StatusType;
  label?: string;
  outline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'active',
  label: '',
  outline: false,
});

interface BadgeStyle {
  color: string;
  textColor?: string;
  icon?: string;
  label: string;
}

const badgeConfig = computed<BadgeStyle>(() => {
  const s = String(props.status).toLowerCase();

  switch (s) {
    case 'active':
    case 'activo':
    case '1':
    case 'true':
      return { color: 'green-2', textColor: 'green-10', icon: 'check_circle', label: 'Activo' };

    case 'inactive':
    case 'inactivo':
    case '0':
    case 'false':
      return { color: 'grey-4', textColor: 'grey-9', icon: 'cancel', label: 'Inactivo' };

    case 'pending':
    case 'pendiente':
      return { color: 'amber-2', textColor: 'amber-10', icon: 'schedule', label: 'Pendiente' };

    case 'critical':
    case 'critico':
    case 'error':
      return { color: 'red-2', textColor: 'red-10', icon: 'error', label: 'Crítico' };

    case 'high':
    case 'alto':
    case 'warning':
      return { color: 'orange-2', textColor: 'orange-10', icon: 'warning', label: 'Alto' };

    case 'medium':
    case 'medio':
      return { color: 'blue-2', textColor: 'blue-10', icon: 'info', label: 'Medio' };

    default:
      return { color: 'grey-3', textColor: 'grey-9', icon: 'help', label: props.status };
  }
});
</script>

<style lang="scss" scoped>
.app-status-badge {
  font-weight: 600;
  font-size: 0.75rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
}
</style>
