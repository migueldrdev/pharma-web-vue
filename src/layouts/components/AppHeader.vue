<script setup lang="ts">
import { Dark } from 'quasar';
import HeaderSearch from './HeaderSearch.vue';
import HeaderNotifications from './HeaderNotifications.vue';
import HeaderUserMenu from './HeaderUserMenu.vue';
import type { ILayoutUser } from '../interfaces/ILayout';

defineOptions({ name: 'AppHeader' });

const props = defineProps<{
  user?: ILayoutUser;
  searchQuery?: string;
}>();

const emit = defineEmits<{
  'update:searchQuery': [value: string];
  'toggle-drawer': [];
  'toggle-theme': [];
  'logout': [];
}>();

const searchModel = defineModel<string>('searchQuery', { default: '' });
</script>

<template>
  <q-header elevated class="bg-primary">
    <q-toolbar>
      <q-btn flat dense round icon="menu" @click="emit('toggle-drawer')" />

      <div class="row items-center q-ml-md q-mr-lg">
        <q-avatar square size="36px" class="bg-white-1 rounded-borders">
          <q-icon name="local_pharmacy" color="white" size="22px" />
        </q-avatar>
        <q-toolbar-title class="q-ml-sm text-white q-mr-none">
          PharmaCare <span style="font-size: 12px; opacity: 0.7">Pro</span>
        </q-toolbar-title>
      </div>

      <div class="gt-sm col-4">
        <HeaderSearch v-model="searchModel" />
      </div>

      <q-space />

      <HeaderNotifications />
      <q-btn flat dense round :icon="Dark.isActive ? 'light_mode' : 'dark_mode'" @click="emit('toggle-theme')">
        <q-tooltip>Cambiar tema</q-tooltip>
      </q-btn>

      <q-btn flat dense round icon="settings" v-permission="'settings'">
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item clickable :to="{ path: '/settings' }">
              <q-item-section avatar><q-icon name="tune" /></q-item-section>
              <q-item-section>Configuración</q-item-section>
            </q-item>
            <q-item clickable :to="{ path: '/profile' }">
              <q-item-section avatar><q-icon name="person" /></q-item-section>
              <q-item-section>Mi Perfil</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable :to="{ path: '/help' }">
              <q-item-section avatar><q-icon name="help" /></q-item-section>
              <q-item-section>Ayuda</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <HeaderUserMenu v-if="user" :user="user" @logout="emit('logout')" />
    </q-toolbar>
  </q-header>
</template>

<style lang="scss" scoped>
.bg-white-1 {
  background: rgba(255, 255, 255, 0.2);
}
</style>
