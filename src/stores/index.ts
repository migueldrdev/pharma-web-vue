import { defineStore } from '@quasar/app-vite/wrappers';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PiniaCustomProperties {
    // add your custom properties here, if any
  }
}

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();

  pinia.use(piniaPluginPersistedstate);

  return pinia;
});
