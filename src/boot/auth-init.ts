import { boot } from 'quasar/wrappers';
import { useAuthStore } from '@stores/login/auth';

export default boot(async () => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch {
      authStore.token = null;
    }
  }
});
