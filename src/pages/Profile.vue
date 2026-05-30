<template>
  <q-page class="q-pa-md">
    <AppPageHeader title="Mi Perfil" subtitle="Información personal" />
    <q-card flat bordered style="max-width:600px" class="q-mb-md">
      <q-card-section class="text-center"><q-avatar size="90px" color="primary" text-color="white" class="q-mb-md">{{ initials }}</q-avatar><div class="text-h6">{{ form.name }}</div><div class="text-grey-7">{{ form.email }}</div></q-card-section>
      <q-card-section>
        <q-input v-model="form.name" label="Nombre" outlined dense class="q-mb-sm" />
        <q-input v-model="form.email" label="Email" outlined dense class="q-mb-sm" />
        <q-btn color="primary" label="Actualizar Perfil" unelevated @click="save" :loading="saving" />
      </q-card-section>
    </q-card>
    <q-btn flat color="grey" icon="lock" label="Cambiar Contraseña" to="/change-password" class="q-mr-sm" />
    <q-btn flat color="negative" icon="logout" label="Cerrar Sesión" @click="logout" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import AppPageHeader from '@components/shared/AppPageHeader.vue';

const $q = useQuasar();
const router = useRouter();
const saving = ref(false);
const form = ref({ name: 'Administrador', email: 'admin@farmacia.com' });
const initials = computed(() => form.value.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2));
function save() { saving.value = true; setTimeout(() => { $q.notify({ type: 'positive', message: 'Perfil actualizado' }); saving.value = false; }, 800); }
function logout() { localStorage.removeItem('token'); void router.push('/login'); }
</script>
