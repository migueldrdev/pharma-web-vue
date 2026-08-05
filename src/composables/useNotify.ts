import { inject } from 'vue';
import { Notify } from 'quasar';
import type { QNotifyCreateOptions } from 'quasar';
import { NOTIFY_KEY } from 'src/types/notify';
import type {
  NotifyAPI,
  NotifyOptions,
  NotifyBackendType,
  LoadingNotifyHandle,
} from 'src/types/notify';

export function createNotifyAPI(): NotifyAPI {
  const api: NotifyAPI = {
    success(message: string, opts: NotifyOptions = {}): void {
      Notify.create({ type: 'success', message, ...opts } as QNotifyCreateOptions);
    },

    error(message: string, opts: NotifyOptions = {}): void {
      Notify.create({ type: 'error', message, timeout: 5000, ...opts } as QNotifyCreateOptions);
    },

    warning(message: string, opts: NotifyOptions = {}): void {
      Notify.create({ type: 'warning', message, ...opts } as QNotifyCreateOptions);
    },

    info(message: string, opts: NotifyOptions = {}): void {
      Notify.create({ type: 'info', message, ...opts } as QNotifyCreateOptions);
    },

    question(message: string, opts: NotifyOptions = {}): void {
      Notify.create({ type: 'question', message, timeout: 0, ...opts } as QNotifyCreateOptions);
    },

    critical(message: string, opts: NotifyOptions = {}): void {
      Notify.create({ type: 'critical', message, timeout: 6000, ...opts } as QNotifyCreateOptions);
    },

    loading(message: string = 'Cargando...'): LoadingNotifyHandle {
      const dismiss = Notify.create({
        type: 'ongoing',
        message,
        position: 'bottom-right',
        timeout: 0,
        spinner: true,
        group: false,
        progress: false,
      });

      return {
        update(msg: string): void {
          dismiss({ message: msg, type: 'ongoing', spinner: true });
        },
        dismissFn(): void {
          dismiss({ type: 'positive', message, timeout: 300, spinner: false });
        },
      };
    },

    fromBackend(type: NotifyBackendType, message: string): void {
      const handlers: Record<NotifyBackendType, (msg: string) => void> = {
        success: (msg: string) => api.success(msg),
        error: (msg: string) => api.error(msg),
        warning: (msg: string) => api.warning(msg),
        info: (msg: string) => api.info(msg),
        critical: (msg: string) => api.critical(msg),
        positive: (msg: string) => api.success(msg),
        negative: (msg: string) => api.error(msg),
        danger: (msg: string) => api.error(msg),
        question: (msg: string) => api.question(msg),
      };

      const handler = handlers[type];
      if (handler) {
        handler(message);
      } else {
        api.info(message);
      }
    },

    create: Notify.create,
  };

  return api;
}

export function useNotify(): NotifyAPI {
  const provided = inject(NOTIFY_KEY, null);
  if (provided) {
    return provided;
  }
  return createNotifyAPI();
}
