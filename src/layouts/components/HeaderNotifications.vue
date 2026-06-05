<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAlerts } from '@/composables/useAlerts'
import { useNotify } from '@/composables/useNotify'

defineOptions({ name: 'HeaderNotifications' })

const router = useRouter()
const { success } = useNotify()
const {
  alerts,
  loading,
  unreadCount,
  criticalCount,
  markAsRead,
  markAllAsRead,
  getAlertRoute,
} = useAlerts()

const hasCritical = computed<boolean>(() => criticalCount.value > 0)
const badgeColor = computed<string>(() => (hasCritical.value ? 'deep-orange' : 'red'))

function getAlertIcon(type: string, severity: string): string {
  if (type === 'low_stock') return severity === 'critical' ? 'block' : 'warning'
  if (type === 'expiry') return severity === 'critical' ? 'event_busy' : 'schedule'
  return 'notifications'
}

function getAlertColor(type: string, severity: string): string {
  if (severity === 'critical') return 'deep-orange'
  if (severity === 'high') return 'negative'
  if (severity === 'medium') return 'warning'
  if (type === 'low_stock') return 'warning'
  if (type === 'expiry') return 'info'
  return 'primary'
}

function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays}d`
}

function dismissAlert(id: number | string): void {
  markAsRead(id)
}

function onNotificationClick(alertItem: (typeof alerts.value)[0]): void {
  markAsRead(alertItem.id)
  const route = getAlertRoute(alertItem)
  void router.push(route)
}

function handleMarkAllRead(): void {
  markAllAsRead()
  success('Todas las notificaciones marcadas como leídas')
}
</script>

<template>
  <q-btn flat dense round icon="notifications" :loading="loading">
    <q-badge
      v-if="unreadCount"
      :color="badgeColor"
      floating
      rounded
      :label="unreadCount > 99 ? '99+' : String(unreadCount)"
    />
    <q-menu
      transition-show="scale"
      transition-hide="scale"
      anchor="bottom right"
      self="top right"
    >
      <div style="width: 360px; max-height: 480px">
        <!-- Header -->
        <div
          class="row items-center justify-between q-px-md q-py-sm"
          style="border-bottom: 1px solid rgba(0,0,0,0.08)"
        >
          <div class="row items-center q-gutter-sm">
            <strong class="text-h6">Notificaciones</strong>
            <q-chip
              v-if="unreadCount"
              :color="badgeColor"
              text-color="white"
              dense
              size="sm"
              :label="unreadCount"
            />
          </div>
          <q-btn
            v-if="unreadCount"
            flat
            dense
            size="sm"
            icon="mark_email_read"
            round
            @click="handleMarkAllRead"
          >
            <q-tooltip>Marcar todas como leídas</q-tooltip>
          </q-btn>
        </div>

        <!-- Empty state -->
        <div
          v-if="alerts.length === 0 && !loading"
          class="flex column items-center justify-center q-py-xl text-grey"
        >
          <q-icon name="notifications_off" size="3rem" />
          <p class="q-mt-sm">No hay notificaciones</p>
        </div>

        <!-- Alerts list with swipe -->
        <q-virtual-scroll
          v-else
          :items="alerts"
          style="max-height: 420px"
          separator
        >
          <template #default="{ item }">
            <q-item
              :key="item.id"
              clickable
              :class="{ 'bg-grey-2': !item.read }"
              class="q-my-xs"
              @click="onNotificationClick(item)"
            >
              <!-- Swipe to dismiss -->
              <q-item-section side>
                <q-icon
                  :name="getAlertIcon(item.type, item.severity)"
                  :color="getAlertColor(item.type, item.severity)"
                  size="sm"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label
                  :class="{ 'text-weight-bold': !item.read }"
                  :lines="2"
                >
                  {{ item.product_name || item.batch_number || 'Alerta' }}
                </q-item-label>
                <q-item-label caption :lines="2">{{ item.message }}</q-item-label>
                <q-item-label caption class="text-grey-6 text-caption">
                  <span>{{ formatTime(item.created_at) }}</span>
                  <span v-if="item.type === 'low_stock' && item.stock !== undefined">
                    &middot; Stock: {{ item.stock }}
                  </span>
                  <span v-if="item.type === 'expiry' && item.days_until_expiry !== undefined">
                    &middot; Vence en {{ item.days_until_expiry }}d
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge
                  :color="getAlertColor(item.type, item.severity)"
                  :label="item.severity === 'critical' ? '!' : (item.severity === 'high' ? '!' : '')"
                  rounded
                  size="sm"
                  v-if="item.severity === 'critical' || item.severity === 'high'"
                />
                <q-icon
                  v-if="!item.read"
                  name="fiber_manual_record"
                  size="8px"
                  color="primary"
                  class="q-ml-sm"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>

        <!-- Footer: ver todas -->
        <div
          v-if="alerts.length > 0"
          class="text-center q-py-sm"
          style="border-top: 1px solid rgba(0,0,0,0.08)"
        >
          <q-btn
            flat
            dense
            color="primary"
            label="Ver todas las alertas"
            icon-right="arrow_forward"
            @click="void router.push('/inventory/alerts')"
          />
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<style scoped>
.q-virtual-scroll .q-item {
  min-height: 56px;
  transition: background-color 0.2s ease;
}
.q-virtual-scroll .q-item:hover {
  background-color: rgba(0, 0, 0, 0.03) !important;
}
</style>
