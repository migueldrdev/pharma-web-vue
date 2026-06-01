import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp';

export const purchaseResources = {
  list: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/purchase', method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  show: (id: number): IHttpResourceOption => ({
    path: '/purchase', method: HttpMethods.Get, paramsRoute: [String(id)],
  }),
  create: { path: '/purchase', method: HttpMethods.Post } as IHttpResourceOption,
} as const;

export const supplierResources = {
  list: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/supplier', method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  show: (id: number): IHttpResourceOption => ({
    path: '/supplier', method: HttpMethods.Get, paramsRoute: [String(id)],
  }),
  create: { path: '/supplier', method: HttpMethods.Post } as IHttpResourceOption,
  update: (id: number): IHttpResourceOption => ({
    path: '/supplier', method: HttpMethods.Put, paramsRoute: [String(id)],
  }),
  delete: (id: number): IHttpResourceOption => ({
    path: '/supplier', method: HttpMethods.Delete, paramsRoute: [String(id)],
  }),
} as const;
