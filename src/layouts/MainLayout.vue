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

    <q-page-container class="bg-grey-1">
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Dark, Notify } from 'quasar';
import { useAuthStore } from '@stores/login/auth';
import { useMenuStore } from '@stores/login/auth';
import { usePermissionsStore } from '@stores/login/permissions';
import { useLoading } from '@composables/useLoading';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import { useMainLayout } from './composables/useMainLayout';
import { defaultUser, defaultNotifications } from './data/menuItems';

defineOptions({ name: 'MainLayout' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const menuStore = useMenuStore();
const permissionsStore = usePermissionsStore();
const { show, hide } = useLoading();

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

const searchQuery = ref('');
const userData = ref({ ...defaultUser });

async function handleLogout() {
  show();
  try {
    await authStore.logout(router);
    Notify.create({ message: 'Sesión cerrada correctamente', type: 'positive', position: 'top-right' });
  } catch {
    Notify.create({ message: 'Error al cerrar sesión', type: 'negative', position: 'top-right' });
  } finally {
    hide();
  }
}

onMounted(() => {
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

  menuStore.loadMenus();
  permissionsStore.loadPermissions();
});
</script>
