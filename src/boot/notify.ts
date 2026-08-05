import { boot } from 'quasar/wrappers';
import { Notify } from 'quasar';
import { NOTIFY_KEY } from 'src/types/notify';
import { createNotifyAPI } from 'src/composables/useNotify';

export default boot(({ app }) => {
  Notify.registerType('success', {
    icon: 'check_circle_outline',
    color: 'positive',
    progress: true,
    timeout: 3000,
    position: 'top-right',
    actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
  });

  Notify.registerType('error', {
    icon: 'close',
    color: 'negative',
    progress: true,
    timeout: 5000,
    position: 'top-right',
    actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
  });

  Notify.registerType('warning', {
    icon: 'warning_amber',
    color: 'warning',
    textColor: 'dark',
    progress: true,
    timeout: 3000,
    position: 'top-right',
    actions: [{ icon: 'close', color: 'dark', round: true, size: 'sm' }],
  });

  Notify.registerType('info', {
    icon: 'info_outline',
    color: 'info',
    progress: true,
    timeout: 3000,
    position: 'top-right',
    actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
  });

  Notify.registerType('question', {
    icon: 'help_outline',
    color: 'purple',
    textColor: 'white',
    progress: true,
    timeout: 0,
    position: 'center',
    actions: [
      { label: 'Cancelar', color: 'grey', flat: true },
      { label: 'Aceptar', color: 'white', flat: true },
    ],
  });

  Notify.registerType('critical', {
    icon: 'gpp_bad',
    color: 'deep-red',
    progress: true,
    timeout: 6000,
    position: 'top-right',
    actions: [{ icon: 'close', color: 'white', round: true, size: 'sm' }],
  });

  Notify.setDefaults({
    position: 'top-right',
    timeout: 3000,
    progress: true,
  });

  const api = createNotifyAPI();
  app.provide(NOTIFY_KEY, api);
});
