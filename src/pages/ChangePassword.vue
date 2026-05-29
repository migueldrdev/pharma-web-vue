<template>
  <q-page class="q-pa-md"><AppPageHeader title="Cambiar Contraseña" />
    <q-card flat bordered style="max-width:500px"><q-card-section>
      <q-input v-model="form.current" label="Contraseña Actual" outlined dense type="password" class="q-mb-sm" />
      <q-input v-model="form.newPass" label="Nueva Contraseña" outlined dense type="password" class="q-mb-sm" />
      <q-input v-model="form.confirm" label="Confirmar" outlined dense type="password" class="q-mb-sm" />
      <q-btn color="primary" label="Cambiar" unelevated class="full-width q-mt-sm" @click="change" :loading="l" />
    </q-card-section></q-card>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue'; import { useQuasar } from 'quasar'; import AppPageHeader from '@components/shared/AppPageHeader.vue';
const $q = useQuasar(); const l = ref(false); const form = ref({ current: '', newPass: '', confirm: '' });
function change() { if (form.value.newPass !== form.value.confirm) { $q.notify({ type: 'negative', message: 'No coinciden' }); return; } l.value = true; setTimeout(() => { $q.notify({ type: 'positive', message: 'Actualizada' }); l.value = false; }, 800); }
</script>
