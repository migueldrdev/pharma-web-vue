<template>
  <q-dialog v-model="model" :persistent="persistent" :maximized="maximized">
    <q-card :style="{ width: width, maxWidth: maxWidth }" class="app-form-dialog">
      <q-card-section class="row items-center q-pb-none bg-primary text-white">
        <div class="text-h6 font-medium">{{ title }}</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-form ref="formRef" @submit.prevent="handleSubmit">
          <slot />

          <div class="row items-center justify-end q-gutter-sm q-mt-lg">
            <q-btn
              v-close-popup
              :label="cancelLabel"
              color="grey-7"
              flat
              :disable="loading"
            />
            <q-btn
              type="submit"
              :label="submitLabel"
              :color="submitColor"
              :loading="loading"
              unelevated
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { QForm } from 'quasar';

interface Props {
  title: string;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitColor?: string;
  width?: string;
  maxWidth?: string;
  persistent?: boolean;
  maximized?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  submitLabel: 'Guardar',
  cancelLabel: 'Cancelar',
  submitColor: 'primary',
  width: '550px',
  maxWidth: '95vw',
  persistent: false,
  maximized: false,
});

const emit = defineEmits<{
  (e: 'submit'): void;
}>();

const model = defineModel<boolean>({ default: false });
const formRef = ref<QForm | null>(null);

async function handleSubmit() {
  if (formRef.value) {
    const valid = await formRef.value.validate();
    if (valid) {
      emit('submit');
    }
  } else {
    emit('submit');
  }
}
</script>

<style lang="scss" scoped>
.app-form-dialog {
  border-radius: 12px;
  overflow: hidden;
}
</style>
