import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import type { QNotifyCreateOptions } from 'quasar'

import successSvg from '@/assets/icons/notify/check-circle.svg'
import errorSvg from '@/assets/icons/notify/x-circle.svg'
import warningSvg from '@/assets/icons/notify/exclamation-triangle.svg'
import infoSvg from '@/assets/icons/notify/information-circle.svg'
import questionSvg from '@/assets/icons/notify/question-mark-circle.svg'
import criticalSvg from '@/assets/icons/notify/shield-exclamation.svg'

Notify.registerType('success', {
  icon: successSvg,
  color: 'positive',
  progress: true,
  timeout: 3000,
  position: 'top-right',
  actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
})

Notify.registerType('error', {
  icon: errorSvg,
  color: 'negative',
  progress: true,
  timeout: 5000,
  position: 'top-right',
  actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
})

Notify.registerType('warning', {
  icon: warningSvg,
  color: 'warning',
  textColor: 'dark',
  progress: true,
  timeout: 3000,
  position: 'top-right',
  actions: [{ icon: 'close', color: 'dark', round: true, size: 'sm' }],
})

Notify.registerType('info', {
  icon: infoSvg,
  color: 'info',
  progress: true,
  timeout: 3000,
  position: 'top-right',
  actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
})

Notify.registerType('question', {
  icon: questionSvg,
  color: 'purple',
  textColor: 'white',
  progress: true,
  timeout: 0,
  position: 'center',
  actions: [
    { label: 'Cancelar', color: 'grey', flat: true },
    { label: 'Aceptar', color: 'white', flat: true },
  ],
})

Notify.registerType('critical', {
  icon: criticalSvg,
  color: 'deep-red',
  progress: true,
  timeout: 6000,
  position: 'top-right',
  actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
})

Notify.setDefaults({
  position: 'top-right',
  timeout: 3000,
  progress: true,
} as QNotifyCreateOptions)

export default boot(() => {
  // Notify types are registered during module initialization
})
