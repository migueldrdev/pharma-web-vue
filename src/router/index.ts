import { route } from 'quasar/wrappers';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/router/routes';
import { useAuthStore } from '@stores/login/auth';
import { usePermissionsStore } from '@stores/login/permissions';
import { Notify } from 'quasar';

export default route(() => {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const permissionsStore = usePermissionsStore();

    const publicRoutes = ['/login', '/forgot-password', '/register'];
    const isPublicRoute = publicRoutes.includes(to.path);

    if (!authStore.isAuthenticated && !isPublicRoute) {
      return next('/login');
    }

    if (authStore.isAuthenticated && to.path === '/login') {
      return next('/');
    }

    if (authStore.isAuthenticated && !permissionsStore.userPermissions.length) {
      permissionsStore.initializeUserPermissions();
    }

    if (to.meta?.permission && authStore.isAuthenticated) {
      const hasPermission = permissionsStore.canAccessRoute(to.meta.permission as string);
      if (!hasPermission) {
        Notify.create({
          type: 'negative',
          message: 'No tienes permisos para acceder a esta página',
          position: 'top-right',
          timeout: 3000,
        });
        if (to.path !== '/') {
          return next('/');
        }
      }
    }

    next();
  });

  return router;
});
