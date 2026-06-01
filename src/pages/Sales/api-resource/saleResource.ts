import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp';

export const saleResources = {
  list: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/sale', method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  show: (id: number): IHttpResourceOption => ({
    path: '/sale', method: HttpMethods.Get, paramsRoute: [String(id)],
  }),
  create: { path: '/sale', method: HttpMethods.Post } as IHttpResourceOption,
} as const;
