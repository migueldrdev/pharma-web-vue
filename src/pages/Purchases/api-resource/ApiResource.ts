import { HttpMethods } from '@composables/useFetchHttp';

const resources = {
  createPurchase: () => ({
    path: '/purchase',
    method: HttpMethods.Post,
  }),
  updatePurchase: (id: number) => ({
    path: '/purchase',
    method: HttpMethods.Put,
    slug: `${id}`,
  }),
  deletePurchase: (id: number) => ({
    path: '/purchase',
    method: HttpMethods.Delete,
    slug: `${id}`,
  }),
  showPurchase: (id: number) => ({
    path: '/purchase',
    method: HttpMethods.Get,
    slug: `${id}`,
  }),
  allPurchases: () => ({
    path: '/purchase',
    method: HttpMethods.Get,
  }),
} as const;

export { resources };
