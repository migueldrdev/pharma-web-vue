<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Mi Perfil" subtitle="Información personal y ajustes de cuenta" />

    <div class="row q-col-gutter-lg q-mt-sm">
      <!-- Columna Izquierda: Identidad -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="pharma-card profile-identity-card text-center q-pa-lg">
          <div class="avatar-wrapper q-mx-auto q-mb-md">
            <q-avatar size="100px" color="teal-1" text-color="primary" class="profile-avatar">
              <span class="text-h3 font-weight-bold">{{ initials }}</span>
            </q-avatar>
          </div>
          
          <h2 class="text-h5 q-mt-none q-mb-xs text-weight-medium">{{ authStore.user?.name || form.name }}</h2>
          <div class="text-grey-7 q-mb-md">{{ authStore.user?.email || form.email }}</div>
          
          <div class="q-mb-md">
            <AppStatusBadge 
              :status="'active'" 
              :label="userRole" 
              class="q-mr-sm"
            />
            <q-chip color="positive" text-color="white" size="sm" class="font-weight-bold">
              Cuenta Activa
            </q-chip>
          </div>

          <q-separator class="q-my-md" />

          <q-btn 
            flat 
            color="negative" 
            icon="mdi-logout" 
            label="Cerrar Sesión" 
            class="full-width q-py-sm font-weight-bold"
            @click="confirmLogout" 
          />
        </q-card>
      </div>

      <!-- Columna Derecha: Formulario -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="pharma-card q-pa-md">
          <q-form @submit.prevent="save">
            <div class="text-h6 q-mb-md text-primary">Datos de Usuario</div>
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="form.name" 
                  label="Nombre Completo" 
                  outlined 
                  class="pharma-input-inset"
                  :rules="[rules.required('El nombre')]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="form.email" 
                  label="Correo Electrónico" 
                  outlined 
                  type="email"
                  class="pharma-input-inset"
                  :rules="[rules.required('El correo'), rules.email]"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="form.phone" 
                  label="Teléfono / Anexo" 
                  outlined 
                  class="pharma-input-inset"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="form.role" 
                  label="Rol Asignado" 
                  outlined 
                  readonly
                  class="pharma-input-inset"
                />
              </div>
            </div>

            <q-separator class="q-my-lg" />

            <div class="text-h6 q-mb-md text-primary">Seguridad de Cuenta</div>
            <div class="text-caption text-grey-7 q-mb-md">
              Deja los campos en blanco si no deseas cambiar tu contraseña actual.
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="form.password" 
                  label="Nueva Contraseña" 
                  outlined 
                  :type="showPassword ? 'text' : 'password'"
                  class="pharma-input-inset"
                >
                  <template v-slot:append>
                    <q-icon 
                      :name="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" 
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="form.password_confirmation" 
                  label="Confirmar Contraseña" 
                  outlined 
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  class="pharma-input-inset"
                  :rules="[
                    val => !form.password || val === form.password || 'Las contraseñas no coinciden'
                  ]"
                >
                  <template v-slot:append>
                    <q-icon 
                      :name="showPasswordConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" 
                      class="cursor-pointer"
                      @click="showPasswordConfirm = !showPasswordConfirm"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <q-separator class="q-my-lg" />

            <div class="text-h6 q-mb-md text-primary">Personalización Visual</div>
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-4">
                <q-toggle 
                  :model-value="themeStore.isDark" 
                  @update:model-value="themeStore.toggleDarkMode()"
                  label="Modo Oscuro" 
                  color="primary"
                />
              </div>
              <div class="col-12 col-md-8">
                <div class="text-caption q-mb-sm text-muted">Color de Marca de la Farmacia</div>
                <div class="row q-gutter-sm">
                  <q-btn
                    v-for="preset in themeStore.presets"
                    :key="preset.id"
                    round
                    size="sm"
                    :style="{ backgroundColor: preset.color }"
                    @click="themeStore.setPreset(preset.id)"
                  >
                    <q-icon
                      v-if="themeStore.activePresetId === preset.id"
                      name="mdi-check"
                      color="white"
                      size="xs"
                    />
                  </q-btn>
                </div>
              </div>
            </div>

            <div class="row justify-end q-mt-lg">
              <q-btn 
                type="submit"
                color="primary" 
                label="Guardar Cambios" 
                icon="mdi-content-save"
                unelevated
                class="pharma-btn-main q-px-xl"
                :loading="saving" 
              />
            </div>
          </q-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import AppPageHeader from 'src/components/shared/AppPageHeader.vue';
import AppStatusBadge from 'src/components/shared/AppStatusBadge.vue';
import { useAuthStore } from 'src/stores/login/auth';
import { useNotify } from 'src/composables/useNotify';
import { useValidation } from 'src/composables/useValidation';
import { useThemeStore } from '@stores/theme/themeStore';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const notify = useNotify();
const rules = useValidation();

const saving = ref(false);
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  password_confirmation: ''
});

onMounted(() => {
  if (authStore.user) {
    form.value.name = authStore.user.name;
    form.value.email = authStore.user.email;
    form.value.role = authStore.user.role?.name || 'Personal Autorizado';
  } else {
    // Fallback if no user loaded (for design testing)
    form.value.name = 'Administrador';
    form.value.email = 'admin@farmacia.com';
    form.value.role = 'Administrador';
  }
});

const userRole = computed(() => {
  return authStore.user?.role?.name || form.value.role || 'Personal Autorizado';
});

const initials = computed(() => {
  const name = authStore.user?.name || form.value.name || 'Usuario';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
});

function save() {
  saving.value = true;
  
  // Simulate API call
  setTimeout(() => {
    saving.value = false;
    notify.success('Perfil actualizado correctamente');
    
    // Clear passwords after save
    form.value.password = '';
    form.value.password_confirmation = '';
  }, 1000);
}

function confirmLogout() {
  $q.dialog({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro que deseas cerrar sesión?',
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Sí, salir',
      unelevated: true
    },
    cancel: {
      flat: true,
      label: 'Cancelar',
      color: 'grey-8'
    }
  }).onOk(() => {
    authStore.logout(router)
      .then(() => {
        notify.info('Sesión cerrada');
        void router.push('/login');
      })
      .catch(() => {
        notify.error('Error al cerrar sesión');
      });
  });
}
</script>

<style lang="scss" scoped>
.pharma-card {
  border-radius: 12px;
  background-color: var(--surface-card);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
}

.profile-identity-card {
  height: 100%;
}

.avatar-wrapper {
  padding: 4px;
  border-radius: 50%;
  border: 2px solid $primary;
  display: inline-block;
}

.profile-avatar {
  background-color: rgba(0, 180, 166, 0.1); /* Teal background */
  color: $primary;
}

.pharma-input-inset {
  :deep(.q-field__control) {
    border-radius: 8px;
    background-color: var(--surface-base);
    transition: all 0.3s ease;
    
    &:hover {
      filter: brightness(0.95);
    }
  }
  
  :deep(.q-field__control:before) {
    border-color: var(--border-subtle);
  }
}

.pharma-btn-main {
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.font-weight-bold {
  font-weight: 600;
}
</style>
