import { boot } from 'quasar/wrappers'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

export default boot(() => {
  const token = localStorage.getItem('token')
  const appKey = import.meta.env.VITE_REVERB_APP_KEY

  if (!appKey) {
    return
  }

  const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || 8080)

  try {
    const echo = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
      wsPort: reverbPort,
      wssPort: reverbPort,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1'}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    window.Echo = echo
  } catch {
    // Silenciar error si el servidor WebSocket no responde
  }
})
