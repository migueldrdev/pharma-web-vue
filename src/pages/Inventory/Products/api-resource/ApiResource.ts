import { HttpMethods, IHttpResourceOption } from '@composables/useFetchHttp';

type KeyResource =
  | 'createProduct'
  | 'updateProduct'
  | 'deleteProduct'
  | 'deleteProducts'
  | 'showProduct'
  | 'allProduct';

const resources: Record<KeyResource, IHttpResourceOption> = {
  createProduct: <IHttpResourceOption>{
    path: '/product',
    method: HttpMethods.Post,
  },
  updateProduct: <IHttpResourceOption>{
    path: '/product',
    method: HttpMethods.Post,
  },
  deleteProduct: <IHttpResourceOption>{
    path: '/product',
    method: HttpMethods.Delete,
  },
  deleteProducts: <IHttpResourceOption>{
    path: '/product',
    method: HttpMethods.Put,
  },
  showProduct: <IHttpResourceOption>{
    path: '/product',
    method: HttpMethods.Get,
  },
  allProduct: <IHttpResourceOption>{
    path: '/product',
    method: HttpMethods.Get,
  },
};

export { resources };
