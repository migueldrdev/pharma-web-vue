import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFetchHttp } from './useFetchHttp'
import { alertResources } from '@/api-resources/alertResource'

interface AlertItem {
  id: number | string
  type: string
  product_id?: number
  product_name?: string
  product_code?: string
  batch_number?: string
  message: string
  severity: string
  stock?: number
  expiration_date?: string
  days_until_expiry?: number
  created_at?: string
  read: boolean
  category_name?: string
}

interface AlertsResponse {
  alerts: AlertItem[]
  count: number
  critical: number
  high: number
  medium: number
  total_value_at_risk?: number
  summary?: {
    stock_alerts: number
    expiry_alerts: number
    critical: number
    high: number
    medium: number
  }
}

export function useAlerts() {
  const alerts = ref<AlertItem[]>([])
  const loading = ref<boolean>(false)
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)

  const unreadCount = computed<number>(() => alerts.value.filter((a) => !a.read).length)
  const criticalCount = computed<number>(() => alerts.value.filter((a) => a.severity === 'critical' && !a.read).length)
  const stockAlertCount = computed<number>(() => alerts.value.filter((a) => a.type === 'low_stock' && !a.read).length)
  const expiryAlertCount = computed<number>(() => alerts.value.filter((a) => a.type === 'expiry' && !a.read).length)

  const { fetchHttpResource } = useFetchHttp()

  async function fetchAlerts(): Promise<void> {
    loading.value = true
    try {
      const res = await fetchHttpResource<AlertsResponse>(alertResources.all, true)
      if (res.success && res.data?.alerts) {
        alerts.value = res.data.alerts.map((alert: AlertItem) => ({
          ...alert,
          read: alert.read ?? false,
        }))
      }
    } catch {
      // Silencioso - ya manejado por useFetchHttp
    } finally {
      loading.value = false
    }
  }

  function markAsRead(id: number | string): void {
    const alert = alerts.value.find((a) => a.id === id)
    if (alert) {
      alert.read = true
    }
  }

  function markAllAsRead(): void {
    alerts.value.forEach((a) => {
      a.read = true
    })
  }

  function getAlertRoute(alert: AlertItem): string {
    switch (alert.type) {
      case 'low_stock':
        return `/inventory/alerts`
      case 'expiry':
        return `/inventory/expiry`
      default:
        return '/inventory/alerts'
    }
  }

  function startPolling(intervalMs: number = 60000): void {
    stopPolling()
    fetchAlerts()
    pollingInterval.value = setInterval(fetchAlerts, intervalMs)
  }

  function stopPolling(): void {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  onMounted(() => {
    startPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    alerts,
    loading,
    unreadCount,
    criticalCount,
    stockAlertCount,
    expiryAlertCount,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    getAlertRoute,
    startPolling,
    stopPolling,
  }
}
