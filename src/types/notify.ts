import type { InjectionKey } from 'vue';
import type { QNotifyCreateOptions } from 'quasar';

export type NotifyType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'question'
  | 'critical';

export type NotifyBackendType =
  | NotifyType
  | 'positive'
  | 'negative'
  | 'danger';

export interface NotifyOptions {
  caption?: string;
  html?: boolean;
  timeout?: number;
  position?: QNotifyCreateOptions['position'];
  group?: string | false;
  actions?: QNotifyCreateOptions['actions'];
}

export interface LoadingNotifyHandle {
  update: (msg: string) => void;
  dismissFn: () => void;
}

export interface NotifyAPI {
  success: (message: string, opts?: NotifyOptions) => void;
  error: (message: string, opts?: NotifyOptions) => void;
  warning: (message: string, opts?: NotifyOptions) => void;
  info: (message: string, opts?: NotifyOptions) => void;
  question: (message: string, opts?: NotifyOptions) => void;
  critical: (message: string, opts?: NotifyOptions) => void;
  loading: (message?: string) => LoadingNotifyHandle;
  fromBackend: (type: NotifyBackendType, message: string) => void;
  create: (opts: QNotifyCreateOptions) => (props?: QNotifyCreateOptions) => void;
}

export const NOTIFY_KEY: InjectionKey<NotifyAPI> = Symbol('notify');
