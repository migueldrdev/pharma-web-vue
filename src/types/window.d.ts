import Echo from 'laravel-echo'

declare global {
  interface Window {
    Pusher?: unknown
    Echo?: Echo<'reverb'>
  }
}

export {}
