<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Configuración General" subtitle="Ajustes de la aplicación" />
    <q-card flat bordered class="q-mb-md"><q-card-section>
      <div class="text-subtitle1 text-primary q-mb-md">Información de la Farmacia</div>
      <div class="row q-col-gutter-md">
        <div class="col-md-6 col-xs-12">
          <q-input v-model="form.name" label="Nombre de la Farmacia" outlined dense class="q-mb-sm" />
          <q-input v-model="form.address" label="Dirección" outlined dense class="q-mb-sm" />
        </div>
        <div class="col-md-6 col-xs-12">
          <q-input v-model="form.phone" label="Teléfono" outlined dense class="q-mb-sm" />
          <q-input v-model="form.email" label="Email" outlined dense class="q-mb-sm" />
        </div>
      </div>
      <q-btn color="primary" label="Guardar Cambios" @click="save" unelevated :loading="saving" />
    </q-card-section></q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
const $q = useQuasar();
const saving = ref(false);
const form = ref({ name: 'FarmaERP', address: '', phone: '', email: '' });
function save() { saving.value = true; setTimeout(() => { $q.notify({ type: 'positive', message: 'Configuración guardada' }); saving.value = false; }, 800); }
</script>
