import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { useAuthStore } from '@stores/login/auth';

export function useLogin() {
  const authStore = useAuthStore();
  const router = useRouter();
  const loading = ref(false);

  async function handleLogin(email: string, password: string) {
    loading.value = true;
    try {
      await authStore.login(email, password);
      await router.push('/');
    } catch (_e: unknown) {
      Notify.create({
        type: 'negative',
        message: 'Credenciales inválidas',
        position: 'top',
        timeout: 3000,
      });
    } finally {
      loading.value = false;
    }
  }

  return { loading, handleLogin };
}
