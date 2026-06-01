<script setup lang="ts">
import { computed } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';
import type { ILayoutNotification } from '../interfaces/ILayout';
import { defaultNotifications } from '../data/menuItems';

defineOptions({ name: 'HeaderNotifications' });

const props = withDefaults(defineProps<{
  notifications?: ILayoutNotification[];
}>(), {
  notifications: () => [...defaultNotifications],
});

const router = useRouter();

const unreadCount = computed(() => props.notifications.filter((n) => !n.read).length);

function markAllAsRead() {
  props.notifications.forEach((n) => (n.read = true));
  Notify.create({
    message: 'Todas las notificaciones marcadas como leídas',
    type: 'positive',
    position: 'top-right',
  });
}

function onNotificationClick(n: ILayoutNotification) {
  n.read = true;
  if (n.title === 'Configuración') {
    router.push('/settings');
  }
}
</script>

<template>
  <q-btn flat dense round icon="notifications" v-permission="'notifications'">
    <q-badge v-if="unreadCount" color="red" floating rounded>
      {{ unreadCount }}
    </q-badge>
    <q-menu>
      <div style="width: 320px; max-height: 400px">
        <div class="row items-center justify-between q-pa-md" style="border-bottom: 1px solid $grey-3">
          <strong>Notificaciones</strong>
          <q-btn flat dense icon="mark_email_read" size="sm" @click="markAllAsRead" />
        </div>
        <q-list>
          <q-item
            v-for="n in notifications"
            :key="n.id"
            clickable
            :class="!n.read ? 'bg-primary-1' : ''"
            @click="onNotificationClick(n)"
          >
            <q-item-section avatar>
              <q-icon :name="n.icon" :color="n.color" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ n.title }}</q-item-label>
              <q-item-label caption>{{ n.message }}</q-item-label>
              <q-item-label caption class="text-grey">{{ n.time }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-menu>
  </q-btn>
</template>
