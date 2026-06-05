import { boot } from 'quasar/wrappers'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

export default boot(() => {
  const token = localStorage.getItem('token')

  const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY ?? '',
    wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) ?? 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) ?? 8080,
    forceTLS: false,
    enabledTransports: ['ws'],
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:80/api/v1'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  window.Echo = echo
})
