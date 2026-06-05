import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp'

export const batchResources = {
  list: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/batch',
    method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  show: (id: number): IHttpResourceOption => ({
    path: '/batch',
    method: HttpMethods.Get,
    paramsRoute: [String(id)],
  }),
  adjust: (id: number): IHttpResourceOption => ({
    path: '/batch',
    method: HttpMethods.Post,
    paramsRoute: [String(id), 'adjust'],
  }),
  combo: (productId: number): IHttpResourceOption => ({
    path: '/batches-combo',
    method: HttpMethods.Get,
    params: { product_id: productId },
  }),
  summary: {
    path: '/batches-summary',
    method: HttpMethods.Get,
  } as IHttpResourceOption,
} as const
