<script setup lang="ts">
import type { ILayoutUser } from '../interfaces/ILayout';
import { defaultUser } from '../data/menuItems';
import { useRouter } from 'vue-router';

defineOptions({ name: 'SidebarProfile' });

withDefaults(
  defineProps<{
    user?: ILayoutUser;
    mini?: boolean;
  }>(),
  {
    user: () => ({ ...defaultUser }),
    mini: false,
  },
);

const router = useRouter();

function navigate() {
  void router.push('/profile');
}
</script>

<template>
  <div class="row items-center q-pa-md q-gutter-x-md" :class="{ 'justify-center': mini }">
    <q-avatar class="cursor-pointer" :size="mini ? 'sm' : 'lg'" rounded @click="navigate">
      <img :src="user!.avatar" />
    </q-avatar>
    <div v-if="!mini" class="column" style="line-height: 1.2">
      <span class="text-weight-medium">{{ user!.name }}</span>
      <span class="text-caption text-grey-7">{{ user!.role }}</span>
      <span class="text-caption text-positive" style="font-size: 11px">
        <q-icon name="circle" size="8px" color="positive" /> En línea
      </span>
    </div>
  </div>
</template>
