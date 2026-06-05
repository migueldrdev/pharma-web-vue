<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ name: 'LoginForm' });

const emit = defineEmits<{
  submit: [email: string, password: string];
}>();

const email = ref('');
const password = ref('');
const isPwd = ref(true);
const loading = ref(false);

defineExpose({
  setLoading: (val: boolean) => {
    loading.value = val;
  },
});

function handleSubmit() {
  if (email.value && password.value) {
    emit('submit', email.value, password.value);
  }
}
</script>

<template>
  <q-form @submit.prevent="handleSubmit" class="column q-gutter-y-md">
    <q-input
      v-model="email"
      outlined
      label="Correo electrónico"
      type="email"
      lazy-rules
      :rules="[
        (val: string) => !!val || 'El correo es requerido',
        (val: string) => /.+@.+\..+/.test(val) || 'Correo no válido',
      ]"
      :disable="loading"
    >
      <template #prepend>
        <q-icon name="mail_outline" />
      </template>
    </q-input>

    <q-input
      v-model="password"
      outlined
      :label="'Contraseña'"
      :type="isPwd ? 'password' : 'text'"
      lazy-rules
      :rules="[(val: string) => !!val || 'La contraseña es requerida']"
      :disable="loading"
    >
      <template #prepend>
        <q-icon name="lock_outline" />
      </template>
      <template #append>
        <q-icon
          :name="isPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwd = !isPwd"
        />
      </template>
    </q-input>

    <div class="text-right">
      <q-btn
        flat
        no-caps
        dense
        color="primary"
        label="¿Olvidaste tu contraseña?"
        class="text-caption"
      />
    </div>

    <q-btn
      label="Iniciar Sesión"
      type="submit"
      color="primary"
      unelevated
      no-caps
      size="lg"
      class="full-width"
      :loading="loading"
    />
  </q-form>
</template>
