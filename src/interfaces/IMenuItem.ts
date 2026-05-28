export interface IMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  permission: string;
  description?: string;
  badge?: string | number | undefined;
  badgeColor?: string;
  defaultOpen?: boolean;
  children?: IMenuItem[] | undefined;
  order?: number;
  module?: string;
}
