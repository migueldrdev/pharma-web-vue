<script setup lang="ts">
import { ref } from 'vue';
import { Screen } from 'quasar';

const modelValue = defineModel<boolean>({ required: true });

defineProps<{
  title: string;
  persistent?: boolean;
  width?: string;
}>();

const emit = defineEmits<{
  submit: [];
}>();

const formRef = ref<HTMLFormElement>();

function onHide() {
  modelValue.value = false;
}

function onSubmit() {
  emit('submit');
}

defineExpose({ formRef, close: onHide });
</script>

<template>
  <q-dialog
    v-model="modelValue"
    :persistent="persistent ?? true"
    :maximized="Screen.lt.md"
    transition-show="slide-up"
    transition-hide="slide-down"
    @hide="onHide"
  >
    <q-card :style="{ width: Screen.lt.md ? '100%' : (width ?? '700px'), maxWidth: '95vw' }">
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
        <q-btn flat label="Cancelar" color="grey" @click="onHide" />
        <q-btn unelevated color="primary" label="Guardar" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
