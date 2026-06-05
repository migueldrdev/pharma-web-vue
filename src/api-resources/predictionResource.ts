import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp'

export const predictionResources = {
  index: (params?: Record<string, unknown>): IHttpResourceOption => ({
    path: '/predictions',
    method: HttpMethods.Get,
    ...(params ? { params } : {}),
  }),
  regenerate: {
    path: '/predictions/regenerate',
    method: HttpMethods.Post,
  } as IHttpResourceOption,
} as const
