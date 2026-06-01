<script setup lang="ts">
defineOptions({ name: 'SidebarMiniToggle' });

defineProps<{
  mini: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <div class="flex flex-center q-pa-sm">
    <q-btn
      flat
      dense
      round
      :icon="mini ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
      @click="emit('toggle')"
    />
  </div>
</template>
