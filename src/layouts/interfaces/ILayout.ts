export interface ILayoutNotification {
  id: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  time: string;
  read: boolean;
}

export interface ILayoutBreadcrumb {
  label: string;
  icon?: string;
  to?: string;
}

export interface ILayoutUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}
