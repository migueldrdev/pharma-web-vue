<script setup lang="ts">
import { ref } from 'vue';
import { Screen, Dark } from 'quasar';
import HeaderNotifications from './HeaderNotifications.vue';
import HeaderUserMenu from './HeaderUserMenu.vue';
import type { ILayoutUser } from '../interfaces/ILayout';

defineOptions({ name: 'AppHeader' });

const props = defineProps<{
  user?: ILayoutUser;
}>();

const emit = defineEmits<{
  'update:searchQuery': [value: string];
  'toggle-drawer': [];
  'toggle-theme': [];
  logout: [];
}>();

const searchModel = defineModel<string>('searchQuery', { default: '' });
const showMobileSearch = ref<boolean>(false);

function globalSearch() {
  showMobileSearch.value = false;
}
</script>

<template>
  <q-header elevated class="bg-primary">
    <q-toolbar>
      <q-btn flat dense round icon="menu" @click="emit('toggle-drawer')" />

      <q-toolbar-title class="text-white q-ml-xs">
        <span class="text-weight-bold">PharmaCare</span>
        <span class="text-caption" style="opacity: 0.7"> Pro</span>
      </q-toolbar-title>

      <q-space />

      <q-input
        v-show="Screen.gt.sm"
        v-model="searchModel"
        dark
        dense
        outlined
        placeholder="Buscar productos, clientes..."
        class="search-desktop"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append v-if="searchModel">
          <q-icon name="close" class="cursor-pointer" @click="searchModel = ''" />
        </template>
      </q-input>

      <q-space />

      <q-btn v-if="Screen.lt.md" flat dense round icon="search" @click="showMobileSearch = true">
        <q-tooltip>Buscar</q-tooltip>
      </q-btn>

      <HeaderNotifications />

      <q-btn
        flat
        dense
        round
        :icon="Dark.isActive ? 'light_mode' : 'dark_mode'"
        @click="emit('toggle-theme')"
      >
        <q-tooltip>Cambiar tema</q-tooltip>
      </q-btn>

      <q-btn v-if="Screen.gt.xs" flat dense round icon="settings" v-permission="'settings'">
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

  <q-dialog v-model="showMobileSearch" full-width position="top" backdrop-filter="blur(4px)">
    <q-card class="q-my-md">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Buscar</q-toolbar-title>
        <q-btn flat dense icon="close" v-close-popup />
      </q-toolbar>
      <q-card-section class="q-pt-md">
        <q-input
          v-model="searchModel"
          autofocus
          outlined
          placeholder="Buscar productos, clientes..."
          @keyup.enter="globalSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
          <template #append v-if="searchModel">
            <q-icon name="close" class="cursor-pointer" @click="searchModel = ''" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.search-desktop {
  :deep(.q-field__control) {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.12);
    /* border: 1px solid rgba(255, 255, 255, 0.15); */
    transition: all 0.25s ease;
  }
  :deep(.q-field__control):focus-within {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.4);
    /* box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1); */
  }
  :deep(.q-field__native::placeholder) {
    color: rgba(255, 255, 255, 0.55);
  }
}
</style>
