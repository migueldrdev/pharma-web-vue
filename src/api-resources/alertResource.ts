import { HttpMethods } from '@/composables/useFetchHttp'

const BASE = '/alerts'
const STOCK = '/stock-alerts'
const EXPIRY = '/expiry-alerts'

export const alertResources = {
  all: { path: BASE, method: HttpMethods.Get },
  stock: { path: STOCK, method: HttpMethods.Get },
  expiry: { path: EXPIRY, method: HttpMethods.Get },
  markRead: (id: string) => ({
    path: `${BASE}/${id}`,
    method: HttpMethods.Post,
  }),
}
