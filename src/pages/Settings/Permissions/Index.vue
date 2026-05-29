<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Permisos" subtitle="Administración de roles y permisos" />
    <q-card flat bordered class="q-mb-md"><q-card-section><div class="text-subtitle1 text-primary q-mb-md">Roles</div>
      <div class="row q-col-gutter-md">
        <q-card v-for="role in roles" :key="role.id" flat bordered class="col-md-4 col-sm-6 col-xs-12 cursor-pointer">
          <q-card-section><div class="row items-center"><q-icon :name="role.icon" :color="role.color" size="md" class="q-mr-sm" /><div><div class="text-subtitle1">{{ role.name }}</div><div class="text-caption text-grey">{{ role.description }}</div></div></div></q-card-section>
        </q-card>
      </div>
    </q-card-section></q-card>
    <q-card flat bordered><q-card-section><div class="text-subtitle1 text-primary q-mb-md">Matriz de Permisos</div>
      <q-table :rows="permissions" :columns="permColumns" flat dense hide-pagination row-key="module">
        <template #body-cell="p"><q-td :props="p"><q-checkbox v-if="p.col.name !== 'module'" v-model="p.value" dense /></q-td></template>
      </q-table>
    </q-card-section></q-card>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import AppPageHeader from '@components/shared/AppPageHeader.vue';
const roles = [{ id: 1, name: 'Administrador', description: 'Acceso completo', icon: 'admin_panel_settings', color: 'primary' }, { id: 2, name: 'Cajero', description: 'Solo ventas', icon: 'point_of_sale', color: 'positive' }, { id: 3, name: 'Almacén', description: 'Inventario y compras', icon: 'inventory', color: 'warning' }];
const permColumns = [{ name: 'module', label: 'Módulo', field: 'module', align: 'left' as const }, { name: 'view', label: 'Ver', field: 'view', align: 'center' as const }, { name: 'create', label: 'Crear', field: 'create', align: 'center' as const }, { name: 'edit', label: 'Editar', field: 'edit', align: 'center' as const }, { name: 'delete', label: 'Eliminar', field: 'delete', align: 'center' as const }];
const permissions = ref([{ module: 'Dashboard', view: true, create: false, edit: false, delete: false }, { module: 'Ventas', view: true, create: true, edit: true, delete: false }, { module: 'Productos', view: true, create: true, edit: true, delete: true }, { module: 'Compras', view: true, create: true, edit: true, delete: false }, { module: 'Clientes', view: true, create: true, edit: true, delete: true }]);
</script>
