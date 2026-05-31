export interface IAppNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  link?: string;
}

export type NotifyType = 'success' | 'error' | 'warning' | 'info';

export interface INotifyOptions {
  type?: NotifyType;
  message: string;
  caption?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom' | 'center';
  timeout?: number;
  icon?: string;
  actions?: Array<{ label: string; color?: string; handler: () => void }>;
}
