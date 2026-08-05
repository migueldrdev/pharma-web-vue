import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotify } from '@composables/useNotify';
import { useAuthStore } from '@stores/login/auth';

export function useLogin() {
  const authStore = useAuthStore();
  const router = useRouter();
  const loading = ref(false);
  const { error } = useNotify();

  async function handleLogin(email: string, password: string) {
    loading.value = true;
    try {
      await authStore.login(email, password);
      await router.push('/');
    } catch (_e: unknown) {
      error('Credenciales inválidas');
    } finally {
      loading.value = false;
    }
  }

  return { loading, handleLogin };
}
