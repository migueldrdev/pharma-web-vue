import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp'

export const reportResources = {
  sales: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/reports/sales',
    method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  inventory: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/reports/inventory',
    method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  financial: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/reports/financial',
    method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
} as const
