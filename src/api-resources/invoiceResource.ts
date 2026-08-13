import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp'

export const invoiceResources = {
  saleInvoice: (saleId: number | string): IHttpResourceOption => ({
    path: `/sale/${saleId}/invoice`,
    method: HttpMethods.Get,
    download: true,
    nameDocument: `factura-${saleId}.pdf`,
  }),
  purchaseReceipt: (purchaseId: number | string): IHttpResourceOption => ({
    path: `/purchase/${purchaseId}/receipt`,
    method: HttpMethods.Get,
    download: true,
    nameDocument: `recibo-compra-${purchaseId}.pdf`,
  }),
} as const
