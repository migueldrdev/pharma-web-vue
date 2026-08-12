<template>
  <q-page class="q-pa-md flex flex-center">
    <div style="width: 100%; max-width: 520px;">
      <AppPageHeader 
        title="Cambiar Contraseña" 
        subtitle="Actualiza tus credenciales de acceso al sistema" 
        class="q-mb-md"
      />

      <q-card flat bordered class="pharma-card">
        <q-form @submit.prevent="changePassword">
          <q-card-section class="q-gutter-md">
            <q-input 
              v-model="form.current" 
              label="Contraseña Actual" 
              outlined 
              dense 
              class="pharma-input-inset" 
              :type="showCurrent ? 'text' : 'password'"
              :rules="[val => !!val || 'Requerido']"
            >
              <template #append>
                <q-icon 
                  :name="showCurrent ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" 
                  class="cursor-pointer"
                  @click="showCurrent = !showCurrent" 
                />
              </template>
            </q-input>

            <q-input 
              v-model="form.newPass" 
              label="Nueva Contraseña" 
              outlined 
              dense 
              class="pharma-input-inset" 
              :type="showNew ? 'text' : 'password'"
              :rules="[
                val => !!val || 'Requerido',
                val => val.length >= 6 || 'Mínimo 6 caracteres'
              ]"
            >
              <template #append>
                <q-icon 
                  :name="showNew ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" 
                  class="cursor-pointer"
                  @click="showNew = !showNew" 
                />
              </template>
            </q-input>

            <q-input 
              v-model="form.confirm" 
              label="Confirmar Nueva Contraseña" 
              outlined 
              dense 
              class="pharma-input-inset" 
              :type="showConfirm ? 'text' : 'password'"
              :rules="[
                val => !!val || 'Requerido',
                val => val === form.newPass || 'Las contraseñas no coinciden'
              ]"
            >
              <template #append>
                <q-icon 
                  :name="showConfirm ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" 
                  class="cursor-pointer"
                  @click="showConfirm = !showConfirm" 
                />
              </template>
            </q-input>
          </q-card-section>
          
          <q-card-actions class="q-px-md q-pb-md">
            <q-btn 
              type="submit"
              color="primary" 
              label="Cambiar Contraseña" 
              unelevated 
              class="full-width pharma-btn-main" 
              :loading="loading" 
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';

defineOptions({ name: 'ChangePasswordPage' });

const $q = useQuasar();

const form = ref({
  current: '',
  newPass: '',
  confirm: ''
});

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const loading = ref(false);

async function changePassword() {
  if (form.value.newPass !== form.value.confirm) {
    return; // Handled by rules
  }
  
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    $q.notify({ type: 'positive', message: 'Contraseña actualizada exitosamente', position: 'top-right' });
    form.value = { current: '', newPass: '', confirm: '' };
    showCurrent.value = false;
    showNew.value = false;
    showConfirm.value = false;
  } finally {
    loading.value = false;
  }
}
</script>
