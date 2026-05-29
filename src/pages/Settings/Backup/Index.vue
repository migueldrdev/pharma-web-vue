<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Respaldo" subtitle="Copias de seguridad del sistema" />
    <q-card flat bordered class="q-mb-md"><q-card-section>
      <div class="text-subtitle1 text-primary q-mb-sm">Crear Respaldo</div>
      <p class="text-grey-7">Genera una copia de seguridad de toda la base de datos. Se recomienda hacerlo semanalmente.</p>
      <q-btn color="primary" icon="backup" label="Crear Respaldo Ahora" @click="backup" :loading="backingUp" unelevated />
    </q-card-section></q-card>
    <q-card flat bordered><q-card-section>
      <div class="text-subtitle1 text-primary q-mb-sm">Historial de Respaldos</div>
      <q-table :rows="list" :columns="cols" row-key="name" flat dense hide-pagination>
        <template #body-cell-actions><q-td><q-btn icon="download" size="sm" flat round color="primary" /><q-btn icon="delete" size="sm" flat round color="negative" /></q-td></template>
      </q-table>
    </q-card-section></q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
const $q = useQuasar();
const backingUp = ref(false);
const list = ref([{ name: 'backup-2026-05-28.sql', size: '2.4 MB', date: '28/05/2026' }]);
const cols = [{ name: 'name', label: 'Archivo', field: 'name', align: 'left' as const }, { name: 'size', label: 'Tamaño', field: 'size', align: 'left' as const }, { name: 'date', label: 'Fecha', field: 'date', align: 'left' as const }, { name: 'actions', label: '', field: 'name', align: 'right' as const }];
function backup() { backingUp.value = true; setTimeout(() => { backingUp.value = false; $q.notify({ type: 'positive', message: 'Respaldo creado exitosamente' }); }, 2000); }
</script>
