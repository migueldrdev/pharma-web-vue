<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Configuración" subtitle="Administración del sistema" />
    <div class="row q-col-gutter-md">
      <div class="col-md-4 col-sm-6 col-xs-12" v-for="card in cards" :key="card.title">
        <q-card flat bordered class="cursor-pointer" @click="navigate(card.to)">
          <q-card-section class="text-center">
            <q-icon :name="card.icon" size="48px" color="primary" class="q-mb-sm" />
            <div class="text-subtitle1">{{ card.title }}</div>
            <div class="text-caption text-grey">{{ card.desc }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppPageHeader from '@components/shared/AppPageHeader.vue';

const router = useRouter();

const cards = [
  { title: 'General', icon: 'tune', desc: 'Configuración de la farmacia', to: '/settings/general' },
  { title: 'Usuarios', icon: 'manage_accounts', desc: 'Gestión de usuarios', to: '/settings/users' },
  { title: 'Permisos', icon: 'security', desc: 'Roles y permisos', to: '/settings/permissions' },
  { title: 'Respaldo', icon: 'backup', desc: 'Copias de seguridad', to: '/settings/backup' },
];

function navigate(to: string) {
  void router.push(to);
}
</script>
