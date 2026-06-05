import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp'

export const userResources = {
  list: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/user-management',
    method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  show: (id: number): IHttpResourceOption => ({
    path: '/user-management',
    method: HttpMethods.Get,
    paramsRoute: [String(id)],
  }),
  create: {
    path: '/user-management',
    method: HttpMethods.Post,
  } as IHttpResourceOption,
  update: (id: number): IHttpResourceOption => ({
    path: '/user-management',
    method: HttpMethods.Put,
    paramsRoute: [String(id)],
  }),
  delete: (id: number): IHttpResourceOption => ({
    path: '/user-management',
    method: HttpMethods.Delete,
    paramsRoute: [String(id)],
  }),
  combo: {
    path: '/users-combo',
    method: HttpMethods.Get,
  } as IHttpResourceOption,
  changePassword: {
    path: '/change-password',
    method: HttpMethods.Post,
  } as IHttpResourceOption,
} as const
