<template>
  <div class="row items-center justify-center login-page">
    <div class="col-11 col-sm-8 col-md-5 col-lg-4 col-xl-3">
      <q-card flat bordered class="login-card">
        <q-card-section class="text-center bg-primary text-white q-py-lg">
          <q-avatar size="72px" color="white" text-color="primary" class="q-mb-sm">
            <q-icon name="local_pharmacy" size="40px" />
          </q-avatar>
          <h1 class="text-h5 q-ma-none">PharmaCare Pro</h1>
          <p class="text-caption q-ma-none text-white" style="opacity: 0.8">
            Sistema de Gestión Farmacéutica
          </p>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-center q-mb-lg">
            <h2 class="text-h6 q-ma-none">Bienvenido de vuelta</h2>
            <p class="text-caption text-grey-7 q-ma-none q-mt-xs">
              Inicia sesión para acceder al sistema
            </p>
          </div>

          <LoginForm ref="formRef" @submit="onSubmit" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md bg-grey-1">
          <div class="row q-col-gutter-sm justify-center">
            <div class="col-6" v-for="feature in features" :key="feature.label">
              <div class="feature-box flex items-center justify-center q-pa-sm rounded-borders">
                <q-icon :name="feature.icon" color="primary" size="xs" class="q-mr-xs" />
                <span class="text-caption text-grey-8">{{ feature.label }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="text-center q-mt-md">
        <p class="text-caption text-grey-6">
          &copy; 2026 PharmaCare. Sistema seguro y confiable.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from './components/LoginForm.vue';
import { useLogin } from './composables/useLogin';

defineOptions({ name: 'LoginPage' });

const { loading, handleLogin } = useLogin();
const formRef = ref<InstanceType<typeof LoginForm> | null>(null);

const features = [
  { icon: 'inventory_2', label: 'Inventario' },
  { icon: 'shopping_cart', label: 'Compras' },
  { icon: 'people', label: 'Clientes' },
  { icon: 'receipt_long', label: 'Ventas' },
];

async function onSubmit(email: string, password: string) {
  await handleLogin(email, password);
  formRef.value?.setLoading(false);
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, $primary 0%, darken($primary, 12%) 100%);
}

.login-card {
  border-radius: 16px;
  overflow: hidden;
}

.feature-box {
  border: 1px solid $grey-4;
  background: white;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: $primary;
  }
}
</style>
