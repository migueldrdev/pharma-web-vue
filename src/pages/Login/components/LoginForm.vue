<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ name: 'LoginForm' });

const emit = defineEmits<{
  submit: [email: string, password: string];
}>();

const email = ref('');
const password = ref('');
const isPwd = ref(true);
const rememberMe = ref(false);
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
  <q-form @submit.prevent="handleSubmit" class="column q-gutter-y-lg">
    <div>
      <label class="text-subtitle2 text-weight-medium text-dark q-mb-xs block">Correo Electrónico</label>
      <q-input
        v-model="email"
        outlined
        type="email"
        placeholder="ejemplo@farmacia.com"
        lazy-rules
        :rules="[
          (val: string) => !!val || 'El correo es requerido',
          (val: string) => /.+@.+\..+/.test(val) || 'Correo no válido',
        ]"
        :disable="loading"
        class="pharma-input-inset"
        hide-bottom-space
      >
        <template #prepend>
          <q-icon name="mdi-email-outline" color="grey-5" size="20px" />
        </template>
      </q-input>
    </div>

    <div>
      <label class="text-subtitle2 text-weight-medium text-dark q-mb-xs block">Contraseña</label>
      <q-input
        v-model="password"
        outlined
        :type="isPwd ? 'password' : 'text'"
        placeholder="••••••••"
        lazy-rules
        :rules="[(val: string) => !!val || 'La contraseña es requerida']"
        :disable="loading"
        class="pharma-input-inset"
        hide-bottom-space
      >
        <template #prepend>
          <q-icon name="mdi-lock-outline" color="grey-5" size="20px" />
        </template>
        <template #append>
          <q-icon
            :name="isPwd ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            class="cursor-pointer text-grey-5 hover-text-primary transition-colors"
            size="20px"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
    </div>

    <div class="row items-center justify-between">
      <q-checkbox 
        v-model="rememberMe" 
        label="Recordar sesión" 
        color="primary" 
        dense
        class="text-body2 text-grey-7" 
      />
      <q-btn
        flat
        no-caps
        dense
        color="primary"
        label="¿Olvidaste tu contraseña?"
        class="text-body2 text-weight-medium hover-underline q-px-none"
      />
    </div>

    <q-btn
      type="submit"
      color="primary"
      unelevated
      no-caps
      size="lg"
      class="full-width pharma-btn-main q-mt-sm"
      :loading="loading"
    >
      <div class="row items-center">
        <span class="text-weight-bold">Iniciar Sesión</span>
        <q-icon name="mdi-arrow-right" size="20px" class="q-ml-sm transition-transform arrow-icon" />
      </div>
      <template v-slot:loading>
        <q-spinner-dots size="1.5rem" />
      </template>
    </q-btn>
  </q-form>
</template>

<style lang="scss" scoped>
.pharma-input-inset {
  :deep(.q-field__control) {
    background-color: var(--surface-base);
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:before {
      border-color: var(--border-subtle);
      border-width: 1px;
      border-radius: 12px;
    }
    &:hover:before {
      border-color: var(--border-focus);
    }
    &:after {
      border-width: 2px;
      border-radius: 12px;
      border-color: var(--q-primary);
    }
  }
}

.hover-text-primary {
  transition: color 0.2s ease;
  &:hover {
    color: var(--q-primary) !important;
  }
}

.hover-underline {
  &:hover {
    text-decoration: underline;
  }
}

.pharma-btn-main {
  border-radius: 12px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--border-focus) 100%);
  box-shadow: 0 4px 14px var(--border-focus);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px var(--border-focus);
    
    .arrow-icon {
      transform: translateX(4px);
    }
  }
  
  &:active {
    transform: translateY(0);
  }
}
</style>
