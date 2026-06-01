<script setup lang="ts">
import SidebarProfile from './SidebarProfile.vue';
import SidebarMenuList from './SidebarMenuList.vue';
import SidebarMiniToggle from './SidebarMiniToggle.vue';
import type { ILayoutUser } from '../interfaces/ILayout';
import type { IMenuItem } from '@/interfaces/IMenuItem';

defineOptions({ name: 'AppSidebar' });

const props = defineProps<{
  modelValue: boolean;
  mini: boolean;
  user?: ILayoutUser;
  menuItems: IMenuItem[];
  activeRoute: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:mini': [value: boolean];
  'expand': [];
  'navigate': [route: string];
  'toggle-mini': [];
}>();
</script>

<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    show-if-above
    bordered
    :width="280"
    :mini="mini"
  >
    <q-scroll-area class="fit">
      <SidebarProfile v-if="user" :user="user" :mini="mini" />

      <q-separator class="q-mx-md" />

      <SidebarMenuList
        :items="menuItems"
        :mini="mini"
        :active-route="activeRoute"
        @expand="emit('expand')"
        @navigate="emit('navigate', $event)"
      />
    </q-scroll-area>

    <SidebarMiniToggle :mini="mini" @toggle="emit('toggle-mini')" class="absolute-bottom" />
  </q-drawer>
</template>
