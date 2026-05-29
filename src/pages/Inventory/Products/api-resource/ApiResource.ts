import { HttpMethods } from '@composables/useFetchHttp';

const resources = {
  createProduct: () => ({
    path: '/product',
    method: HttpMethods.Post,
  }),
  updateProduct: (id: number) => ({
    path: '/product',
    method: HttpMethods.Put,
    slug: `${id}`,
  }),
  deleteProduct: (id: number) => ({
    path: '/product',
    method: HttpMethods.Delete,
    slug: `${id}`,
  }),
  showProduct: (id: number) => ({
    path: '/product',
    method: HttpMethods.Get,
    slug: `${id}`,
  }),
  allProduct: () => ({
    path: '/product',
    method: HttpMethods.Get,
  }),
} as const;

export { resources };
