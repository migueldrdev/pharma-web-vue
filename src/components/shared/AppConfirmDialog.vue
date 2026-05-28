<script setup lang="ts">
const modelValue = defineModel<boolean>({ required: true });

defineProps<{
  title: string;
  message?: string;
  confirmLabel?: string;
  color?: string;
}>();

const emit = defineEmits<{
  confirm: [];
}>();
</script>

<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <q-icon
          :name="color === 'negative' ? 'warning' : 'help'"
          :color="color ?? 'primary'"
          size="md"
        />
        <span class="q-ml-sm text-h6">{{ title }}</span>
      </q-card-section>

      <q-card-section v-if="message" class="q-pt-sm">
        {{ message }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />
        <q-btn
          unelevated
          :label="confirmLabel ?? 'Confirmar'"
          :color="color ?? 'primary'"
          @click="emit('confirm')"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
