<script setup lang="ts">
import { Screen } from 'quasar';
import type { IMenuItem } from '@/interfaces/IMenuItem';

defineOptions({ name: 'SidebarMenuList' });

const props = defineProps<{
  items: IMenuItem[];
  mini?: boolean;
  activeRoute: string;
}>();

const emit = defineEmits<{
  expand: [];
  navigate: [route: string];
}>();

function onExpand() {
  if (props.mini) {
    emit('expand');
  }
}

function onItemClick(route?: string) {
  if (props.mini) {
    emit('expand');
  }
  if (route) {
    emit('navigate', route);
  }
}
</script>

<template>
  <q-list :class="props.mini ? 'q-pa-xs' : 'q-pa-md'">
    <template v-for="item in items" :key="item.id">
      <q-expansion-item
        v-if="item.children?.length"
        v-permission="item.permission"
        :icon="item.icon"
        :label="mini ? '' : item.label"
        :default-opened="item.defaultOpen"
        :class="{
          'text-primary rounded-borders': item.children.some((c) => c.route === activeRoute),
        }"
        @after-show="onExpand"
      >
        <template v-if="mini" #header>
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
        </template>
        <q-item
          v-for="child in item.children"
          :key="child.id"
          v-permission="child.permission"
          clickable
          :to="child.route"
          :class="{ 'text-primary text-weight-medium': activeRoute === child.route }"
          class="q-ml-md q-mr-sm rounded-borders"
          @click="emit('navigate', child.route ?? '/')"
        >
          <q-item-section avatar>
            <q-icon :name="child.icon" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ child.label }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="child.badge">
            <q-badge :color="child.badgeColor || 'primary'" rounded>
              {{ child.badge }}
            </q-badge>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-item
        v-else
        v-permission="item.permission"
        clickable
        :to="item.route"
        class="rounded-borders"
        :class="{ 'text-primary text-weight-medium': activeRoute === item.route }"
        @click="onItemClick(item.route ?? '/')"
      >
        <q-item-section avatar>
          <q-icon :name="item.icon" />
        </q-item-section>
        <q-item-section v-if="!mini">
          <q-item-label>{{ item.label }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="item.badge && !mini">
          <q-badge :color="item.badgeColor || 'primary'" rounded>
            {{ item.badge }}
          </q-badge>
        </q-item-section>
        <q-tooltip v-if="mini" anchor="center right" self="center left">
          {{ item.label }}
        </q-tooltip>
      </q-item>
    </template>
  </q-list>
</template>
