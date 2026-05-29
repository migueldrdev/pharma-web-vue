<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Usuarios" subtitle="Gestión de usuarios del sistema" />
    <q-card flat bordered><q-card-section>
      <q-input v-model="filter" label="Buscar" outlined dense clearable class="q-mb-md"><template #prepend><q-icon name="search" /></template></q-input>
      <q-table :rows="users" :columns="columns" :filter="filter" row-key="id" flat dense>
        <template #body-cell-active="p"><q-td :props="p"><q-chip :color="p.value ? 'positive' : 'negative'" text-color="white" size="sm" :label="p.value ? 'Activo' : 'Inactivo'" /></q-td></template>
        <template #body-cell-actions><q-td><q-btn icon="edit" size="sm" flat round color="warning" dense /><q-btn icon="delete" size="sm" flat round color="negative" dense /></q-td></template>
      </q-table>
    </q-card-section></q-card>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
const filter = ref('');
const users = ref([{ id: 1, name: 'Administrador', email: 'admin@farmacia.com', role: 'Administrador', active: true }, { id: 2, name: 'Cajero', email: 'cajero@farmacia.com', role: 'Cajero', active: true }]);
const columns = [{ name: 'name', label: 'Nombre', field: 'name', align: 'left' as const }, { name: 'email', label: 'Email', field: 'email', align: 'left' as const }, { name: 'role', label: 'Rol', field: 'role', align: 'left' as const }, { name: 'active', label: 'Estado', field: 'active', align: 'center' as const }, { name: 'actions', label: '', field: 'id', align: 'center' as const }];
</script>
