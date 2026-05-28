<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  persistent?: boolean;
  width?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [];
}>();

const innerValue = ref(props.modelValue);
const formRef = ref();

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val;
  },
);

function onHide() {
  emit('update:modelValue', false);
}

function onSubmit() {
  emit('submit');
}

defineExpose({ formRef, close: onHide });
</script>

<template>
  <q-dialog
    v-model="innerValue"
    :persistent="persistent ?? true"
    :maximized="$q.screen.lt.md"
    transition-show="slide-up"
    transition-hide="slide-down"
    @hide="onHide"
  >
    <q-card :style="{ width: $q.screen.lt.md ? '100%' : width ?? '700px', maxWidth: '95vw' }">
      <q-bar class="bg-primary text-white">
        <q-icon name="edit" />
        <div class="text-subtitle1 q-ml-sm">{{ title }}</div>
        <q-space />
        <q-btn dense flat icon="close" @click="onHide">
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="q-pa-md scroll" style="max-height: 70vh">
        <slot />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey"
          @click="onHide"
        />
        <q-btn
          unelevated
          color="primary"
          label="Guardar"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
