import { boot } from 'quasar/wrappers';
import axios, { AxiosError, AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1',
});

export default boot(({ app, router }) => {
  // 1. Recuperar token si existe (Persistencia al recargar F5)
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // 2. Interceptor: Si el token vence (Error 401), cerrar sesión automáticamente
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        try {
          // Eliminar token de localStorage
          localStorage.removeItem('token');
          // Eliminar header Authorization
          delete api.defaults.headers.common['Authorization'];
          // Redirigir a login si no estamos ya ahí
          if (router.currentRoute.value.path !== '/login') {
            await router.push('/login');
          }
        } catch (e) {
          console.error('Error during automatic logout on 401:', e);
        }
      }
      return Promise.reject(error);
    },
  );

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
