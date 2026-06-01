import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp';

export const productResources = {
  list: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/product',
    method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  show: (id: number): IHttpResourceOption => ({
    path: '/product',
    method: HttpMethods.Get,
    paramsRoute: [String(id)],
  }),
  create: {
    path: '/product',
    method: HttpMethods.Post,
  } as IHttpResourceOption,
  update: (id: number): IHttpResourceOption => ({
    path: '/product',
    method: HttpMethods.Put,
    paramsRoute: [String(id)],
  }),
  delete: (id: number): IHttpResourceOption => ({
    path: '/product',
    method: HttpMethods.Delete,
    paramsRoute: [String(id)],
  }),
} as const;
