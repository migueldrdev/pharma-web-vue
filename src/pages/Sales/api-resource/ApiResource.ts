import { HttpMethods } from '@composables/useFetchHttp';

const resources = {
  createSale: () => ({
    path: '/sale',
    method: HttpMethods.Post,
  }),
  updateSale: (id: number) => ({
    path: '/sale',
    method: HttpMethods.Put,
    slug: `${id}`,
  }),
  deleteSale: (id: number) => ({
    path: '/sale',
    method: HttpMethods.Delete,
    slug: `${id}`,
  }),
  showSale: (id: number) => ({
    path: '/sale',
    method: HttpMethods.Get,
    slug: `${id}`,
  }),
  allSales: () => ({
    path: '/sale',
    method: HttpMethods.Get,
  }),
} as const;

export { resources };
