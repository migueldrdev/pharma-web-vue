import { HttpMethods, type IHttpResourceOption } from '@composables/useFetchHttp';

export const dashboardResources = {
  allSales: { path: '/sale', method: HttpMethods.Get },
  allProducts: { path: '/product', method: HttpMethods.Get },
  showProduct: (id: number): IHttpResourceOption => ({
    path: '/product',
    method: HttpMethods.Get,
    paramsRoute: [String(id)],
  }),
} as const;
