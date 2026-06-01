<script setup lang="ts">
import { Screen } from 'quasar';
import SidebarProfile from './SidebarProfile.vue';
import SidebarMenuList from './SidebarMenuList.vue';
import SidebarMiniToggle from './SidebarMiniToggle.vue';
import type { ILayoutUser } from '../interfaces/ILayout';
import type { IMenuItem } from '@/interfaces/IMenuItem';

defineOptions({ name: 'AppSidebar' });

defineProps<{
  modelValue: boolean;
  mini: boolean;
  user?: ILayoutUser;
  menuItems: IMenuItem[];
  activeRoute: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:mini': [value: boolean];
  expand: [];
  navigate: [route: string];
  'toggle-mini': [];
}>();

function onNavigate(route: string) {
  if (Screen.lt.sm) {
    emit('update:modelValue', false);
  }
  emit('navigate', route);
}
</script>

<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    show-if-above
    bordered
    :width="280"
    :mini="Screen.lt.sm ? false : mini"
  >
    <q-scroll-area class="fit">
      <div class="q-py-md q-mx-md">
        <SidebarProfile v-if="user" :user="user" :mini="Screen.lt.sm ? false : mini" />
      </div>

      <q-separator class="q-mx-md" />

      <SidebarMenuList
        :items="menuItems"
        :mini="Screen.lt.sm ? false : mini"
        :active-route="activeRoute"
        @expand="emit('expand')"
        @navigate="onNavigate"
      />
    </q-scroll-area>

    <SidebarMiniToggle
      v-if="Screen.gt.sm"
      :mini="mini"
      @toggle="emit('toggle-mini')"
      class="absolute-bottom"
    />
  </q-drawer>
</template>
