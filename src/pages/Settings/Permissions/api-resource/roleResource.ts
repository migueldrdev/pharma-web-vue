import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp'

export const roleResources = {
  list: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/role',
    method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  show: (id: number): IHttpResourceOption => ({
    path: '/role',
    method: HttpMethods.Get,
    paramsRoute: [String(id)],
  }),
  create: {
    path: '/role',
    method: HttpMethods.Post,
  } as IHttpResourceOption,
  update: (id: number): IHttpResourceOption => ({
    path: '/role',
    method: HttpMethods.Put,
    paramsRoute: [String(id)],
  }),
  delete: (id: number): IHttpResourceOption => ({
    path: '/role',
    method: HttpMethods.Delete,
    paramsRoute: [String(id)],
  }),
  combo: {
    path: '/roles-combo',
    method: HttpMethods.Get,
  } as IHttpResourceOption,
  permissions: {
    path: '/permissions',
    method: HttpMethods.Get,
  } as IHttpResourceOption,
} as const
