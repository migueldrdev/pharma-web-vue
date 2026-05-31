export interface IKpiData {
  id: string;
  title: string;
  value: number | string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

export interface IKpiCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}
