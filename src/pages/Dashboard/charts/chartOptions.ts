import type { Options } from 'highcharts';

export const chartPalette = ['#00B4A6', '#FF6B6B', '#FF9500', '#6C5CE7', '#A0D911', '#52C41A', '#FF4D4F'];

export function baseChartOptions(height: number = 300): Options {
  return {
    credits: { enabled: false },
    chart: { height, backgroundColor: 'transparent' },
    legend: { enabled: false },
  };
}

export function salesChartSeries(salesData: number[], goalData: number[]): Options['series'] {
  return [
    { name: 'Ventas', type: 'line', data: salesData, lineWidth: 3, marker: { radius: 5 }, dataLabels: { enabled: true, format: 'S/ {y}' } },
    { name: 'Meta', type: 'line', data: goalData, lineWidth: 2, dashStyle: 'Dash' },
  ];
}

export function barChartSeries(name: string, data: number[]): Options['series'] {
  return [{ name, type: 'bar', data, dataLabels: { enabled: true } }];
}

export function pieChartSeries(data: { name: string; y: number }[]): Options['series'] {
  return [{ name: 'Productos', type: 'pie', data, dataLabels: { enabled: true, format: '{point.name}: {point.percentage:.1f}%' } }];
}

export function columnChartSeries(incomeData: number[], expenseData: number[]): Options['series'] {
  return [
    { name: 'Ingresos', type: 'column', data: incomeData },
    { name: 'Gastos', type: 'column', data: expenseData },
  ];
}
