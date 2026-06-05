<template>
  <q-layout view="hHh Lpr lff">
    <AppHeader
      v-model:search-query="searchQuery"
      :user="userData"
      @toggle-drawer="toggleLeftDrawer"
      @toggle-theme="toggleTheme"
      @logout="handleLogout"
    />

    <AppSidebar
      v-model="leftDrawerOpen"
      v-model:mini="miniState"
      :user="userData"
      :menu-items="menuItems"
      :active-route="route.path"
      @expand="expandMini"
      @navigate="navigateTo"
      @toggle-mini="toggleMini"
    />

    <q-page-container>
      <div class="q-pa-md q-pb-none" v-if="breadcrumbs.length">
        <q-breadcrumbs>
          <q-breadcrumbs-el
            v-for="(crumb, index) in breadcrumbs"
            :key="index"
            :label="crumb.label"
            :icon="crumb.icon"
            :to="crumb.to"
          />
        </q-breadcrumbs>
      </div>

      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="animated fadeInRight"
          leave-active-class="animated fadeOutLeft"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Dark } from 'quasar';
import { useAuthStore } from '@stores/login/auth';
import { useMenuStore } from '@stores/login/auth';
import { usePermissionsStore } from '@stores/login/permissions';
import { useLoading } from '@composables/useLoading';
import { useNotify } from '@composables/useNotify';
import { useAlerts } from '@composables/useAlerts';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import { useMainLayout } from './composables/useMainLayout';
import { defaultUser } from './data/menuItems';
import { ILayoutUser } from './interfaces/ILayout.js';

defineOptions({ name: 'MainLayout' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const menuStore = useMenuStore();
const permissionsStore = usePermissionsStore();
const { show, hide } = useLoading();
const { success, error } = useNotify();
const { stockAlertCount, expiryAlertCount, fetchAlerts } = useAlerts();

const {
  leftDrawerOpen,
  miniState,
  menuItems,
  breadcrumbs,
  toggleLeftDrawer,
  toggleMini,
  expandMini,
  toggleTheme,
  navigateTo,
} = useMainLayout();

const searchQuery = ref<string>('');
const userData = ref<ILayoutUser>({ ...defaultUser });

// Actualizar badges del menú con conteos reales
watch([stockAlertCount, expiryAlertCount], ([stock, expiry]) => {
  menuStore.updateMenuBadge('stock-alerts', stock > 0 ? stock : undefined, 'warning');
  menuStore.updateMenuBadge('expiry-alerts', expiry > 0 ? expiry : undefined, 'negative');
});

async function handleLogout() {
  show();
  try {
    await authStore.logout(router);
    success('Sesión cerrada correctamente');
  } catch {
    error('Error al cerrar sesión');
  } finally {
    hide();
  }
}

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    Dark.set(savedTheme === 'dark');
  }

  if (authStore.user) {
    userData.value = {
      id: String(authStore.user.id),
      name: authStore.user.name,
      email: authStore.user.email,
      role: 'Administrador',
      avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    };
  }

  await menuStore.loadMenus();
  await permissionsStore.loadPermissions();
  await fetchAlerts();
});
</script>
