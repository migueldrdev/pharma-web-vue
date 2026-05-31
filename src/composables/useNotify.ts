import { Notify } from 'quasar';
import type { QNotifyCreateOptions } from 'quasar';

const defaultPosition = 'top-right' as const;
const defaultTimeout = 3000;

export function useNotify() {
  const showSuccess = (message: string) =>
    Notify.create({ type: 'positive', icon: 'check_circle', message, position: defaultPosition, timeout: defaultTimeout });

  const showError = (message: string) =>
    Notify.create({ type: 'negative', icon: 'error', message, position: defaultPosition, timeout: 5000 });

  const showWarning = (message: string) =>
    Notify.create({ type: 'warning', icon: 'warning', message, position: defaultPosition, timeout: defaultTimeout });

  const showInfo = (message: string) =>
    Notify.create({ type: 'info', icon: 'info', message, position: defaultPosition, timeout: defaultTimeout });

  const showLoading = (message = 'Cargando...') => {
    Notify.create({
      message,
      position: 'bottom-right',
      timeout: 0,
      spinner: true,
      group: false,
      type: 'ongoing',
    } as QNotifyCreateOptions);
  };

  return { showSuccess, showError, showWarning, showInfo, showLoading };
}
