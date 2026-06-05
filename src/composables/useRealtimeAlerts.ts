import { onMounted, onUnmounted } from 'vue'
import { useAlerts } from './useAlerts'
import { useNotify } from './useNotify'

interface StockAlertPayload {
  type: string
  alerts: {
    id: number
    type: string
    product_name: string
    message: string
    severity: string
    stock?: number
  }[]
  total_count: number
  critical_count: number
  timestamp: string
}

interface ExpiryAlertPayload {
  type: string
  alerts: {
    id: number
    type: string
    product_name: string
    batch_number: string
    message: string
    severity: string
    days_until_expiry?: number
    value_at_risk?: number
  }[]
  total_count: number
  critical_count: number
  total_value_at_risk: number
  timestamp: string
}

export function useRealtimeAlerts() {
  const { alerts, fetchAlerts } = useAlerts()
  const { warning, critical } = useNotify()

  function onStockAlert(payload: StockAlertPayload): void {
    if (payload.critical_count > 0) {
      critical(`${payload.critical_count} productos con stock crítico`)
    } else {
      warning(`${payload.total_count} productos con stock bajo`)
    }
    fetchAlerts()
  }

  function onExpiryAlert(payload: ExpiryAlertPayload): void {
    if (payload.critical_count > 0) {
      critical(`${payload.critical_count} lotes próximos a vencer`)
    } else {
      warning(`${payload.total_count} lotes próximos a vencer`)
    }
    fetchAlerts()
  }

  onMounted(() => {
    if (!window.Echo) return

    window.Echo.channel('alerts')
      .listen('.stock.alert', (payload: StockAlertPayload) => onStockAlert(payload))
      .listen('.expiry.alert', (payload: ExpiryAlertPayload) => onExpiryAlert(payload))
  })

  onUnmounted(() => {
    if (window.Echo) {
      window.Echo.leaveChannel('alerts')
    }
  })

  return { alerts, onStockAlert, onExpiryAlert }
}
