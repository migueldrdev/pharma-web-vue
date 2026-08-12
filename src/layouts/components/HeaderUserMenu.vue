<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { ILayoutUser } from '../interfaces/ILayout';
import { defaultUser } from '../data/menuItems';

defineOptions({ name: 'HeaderUserMenu' });

withDefaults(
  defineProps<{
    user?: ILayoutUser;
  }>(),
  {
    user: () => ({ ...defaultUser }),
  },
);

const emit = defineEmits<{
  logout: [];
}>();

const router = useRouter();

function openProfile() {
  void router.push('/profile');
}

function changePassword() {
  void router.push('/change-password');
}
</script>

<template>
  <q-btn-dropdown flat dense no-caps>
    <template #label>
      <div class="row items-center no-wrap q-gutter-x-sm">
        <q-avatar size="32px">
          <img :src="user!.avatar" />
        </q-avatar>
        <div class="column" style="line-height: 1">
          <span class="text-white text-weight-medium" style="font-size: 14px">{{
            user!.name
          }}</span>
          <span class="text-white" style="font-size: 11px; opacity: 0.8">{{ user!.role }}</span>
        </div>
      </div>
    </template>
    <q-list style="min-width: 200px">
      <q-item-label header>{{ user!.email }}</q-item-label>
      <q-separator />
      <q-item clickable @click="openProfile">
        <q-item-section avatar><q-icon name="account_circle" /></q-item-section>
        <q-item-section>Mi Perfil</q-item-section>
      </q-item>
      <q-item clickable @click="changePassword">
        <q-item-section avatar><q-icon name="lock" /></q-item-section>
        <q-item-section>Cambiar Contraseña</q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable @click="emit('logout')">
        <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
        <q-item-section>
          <q-item-label class="text-negative">Cerrar Sesión</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
