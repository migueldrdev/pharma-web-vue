import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp'

export interface IStockReservationHoldPayload {
  product_id: number
  quantity: number
  session_id: string
  batch_id?: number | null
}

export interface IStockReservationReleasePayload {
  product_id: number
  session_id: string
}

export const stockReservationResources = {
  hold: (data: IStockReservationHoldPayload): IHttpResourceOption => ({
    path: '/stock-reservation/hold',
    method: HttpMethods.Post,
    data: data as unknown as Record<string, unknown>,
  }),
  release: (data: IStockReservationReleasePayload): IHttpResourceOption => ({
    path: '/stock-reservation/release',
    method: HttpMethods.Post,
    data: data as unknown as Record<string, unknown>,
  }),
  summary: (productId: number, sessionId?: string): IHttpResourceOption => ({
    path: `/stock-reservation/summary/${productId}`,
    method: HttpMethods.Get,
    ...(sessionId ? { params: { session_id: sessionId } } : {}),
  }),
} as const
