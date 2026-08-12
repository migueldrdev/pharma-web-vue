<template>
  <div class="pharma-login-canvas row window-height window-width items-center justify-center">
    <!-- Ambient glass circles -->
    <div class="ambient-glow glow-1"></div>
    <div class="ambient-glow glow-2"></div>

    <div class="col-12 col-md-10 col-lg-8 col-xl-7 q-pa-md z-top">
      <q-card class="pharma-card row no-wrap-md wrap-sm overflow-hidden">
        
        <!-- Left Side: Branding & Trust -->
        <div class="col-12 col-md-5 bg-gradient-teal text-white q-pa-xl flex column justify-between brand-section relative-position">
          <div class="pattern-overlay"></div>
          
          <div class="relative-position z-top">
            <div class="row items-center q-mb-xl">
              <q-avatar size="56px" color="white" text-color="primary" class="q-mr-md shadow-2">
                <q-icon name="mdi-pharmacy" size="32px" />
              </q-avatar>
              <div>
                <h1 class="text-h5 text-weight-bold q-ma-none">PharmaCare</h1>
                <div class="text-subtitle2 opacity-80">Pro Edition</div>
              </div>
            </div>

            <div class="q-mt-xl text-body1 text-weight-light lh-lg">
              Sistema inteligente para la gestión integral de farmacias y boticas.
            </div>
          </div>

          <div class="trust-badges q-mt-xl relative-position z-top column q-gutter-y-md">
            <div class="trust-badge row items-center q-pa-sm rounded-borders">
              <q-icon name="mdi-point-of-sale" size="sm" class="q-mr-sm" />
              <span class="text-body2 text-weight-medium">Punto de Venta POS Ultra-rápido</span>
            </div>
            <div class="trust-badge row items-center q-pa-sm rounded-borders">
              <q-icon name="mdi-package-variant-closed" size="sm" class="q-mr-sm" />
              <span class="text-body2 text-weight-medium">Control de Stock y Vencimientos</span>
            </div>
            <div class="trust-badge row items-center q-pa-sm rounded-borders">
              <q-icon name="mdi-receipt-text-check" size="sm" class="q-mr-sm" />
              <span class="text-body2 text-weight-medium">Facturación Electrónica</span>
            </div>
          </div>

          <div class="relative-position z-top q-mt-xl row items-center text-caption opacity-80">
            <q-icon name="mdi-shield-check" size="18px" class="q-mr-xs" />
            Sistema Seguro DIGEMID
          </div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="col-12 col-md-7 q-pa-xl flex column justify-center" style="background-color: var(--surface-card)">
          <div class="q-mb-xl text-center">
            <h2 class="text-h4 text-weight-bolder text-dark q-ma-none q-mb-sm">
              Acceso al Portal
            </h2>
            <p class="text-body1 text-grey-6 q-ma-none">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <LoginForm ref="formRef" @submit="onSubmit" />

          <div class="q-mt-xl text-center">
            <div class="q-mb-sm">
              <q-chip color="blue-1" text-color="blue-8" size="sm" icon="mdi-eye-check">
                Monitoreo de Lotes Activo
              </q-chip>
            </div>
            <p class="text-caption text-grey-5 q-ma-none">
              &copy; {{ new Date().getFullYear() }} PharmaCare. Todos los derechos reservados.
            </p>
          </div>
        </div>

      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from './components/LoginForm.vue';
import { useLogin } from './composables/useLogin';

defineOptions({ name: 'LoginPage' });

const { handleLogin } = useLogin();
const formRef = ref<{ setLoading: (val: boolean) => void } | null>(null);

async function onSubmit(email: string, password: string) {
  formRef.value?.setLoading(true);
  try {
    await handleLogin(email, password);
  } finally {
    formRef.value?.setLoading(false);
  }
}
</script>

<style lang="scss" scoped>
.pharma-login-canvas {
  background-color: var(--surface-base);
  position: relative;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  z-index: 0;
}
.glow-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0,180,166,0.2) 0%, rgba(0,180,166,0) 70%);
  top: -10%;
  left: -10%;
}
.glow-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(108,92,231,0.15) 0%, rgba(108,92,231,0) 70%);
  bottom: -20%;
  right: -10%;
}

.pharma-card {
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.04);
  backdrop-filter: blur(10px);
}

.bg-gradient-teal {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--border-focus) 100%);
}

.brand-section {
  @media (max-width: $breakpoint-sm-max) {
    display: none;
  }
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px);
  background-size: 24px 24px;
  opacity: 0.4;
}

.trust-badge {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.lh-lg {
  line-height: 1.6;
}
.opacity-80 {
  opacity: 0.8;
}
</style>
