import { HttpMethods, IHttpResourceOption } from '@composables/useFetchHttp';

type KeyResource =
  | 'createProduct'
  | 'updateProduct'
  | 'deleteProduct'
  | 'showProduct'
  | 'allProduct';

const resources: Record<KeyResource, (id?: number) => IHttpResourceOption> = {
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
};

export { resources };
