import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, Loading, Dialog } from 'quasar';
import HighchartsVue from 'highcharts-vue';

import 'quasar/src/css/index.sass';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/roboto-font/roboto-font.css';

import App from './App.vue';
import { useAuthStore, useMenuStore } from '@stores/login/auth';
import { usePermissionsStore } from '@stores/login/permissions';
import permissionDirective from './directives/permission';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(Quasar, {
  plugins: { Notify, Loading, Dialog },
  config: {
    notify: { position: 'top-right', timeout: 2500, textColor: 'white', actions: [{ icon: 'close', color: 'white' }] },
    loading: { delay: 200, message: 'Cargando...', spinnerColor: 'primary', messageColor: 'primary' },
  },
});

app.use(HighchartsVue);
app.directive('permission', permissionDirective);

const initApp = async () => {
  try {
    Loading.show();

    const authStore = useAuthStore();
    const permissionsStore = usePermissionsStore();
    const menuStore = useMenuStore();

    if (authStore.user) {
      await Promise.all([
        permissionsStore.loadPermissions(),
        permissionsStore.initializeUserPermissions(),
        menuStore.loadMenus(),
      ]);
    }
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    Notify.create({
      type: 'negative',
      message: 'Error al inicializar la aplicación',
      position: 'top-right',
    });
  } finally {
    Loading.hide();
    app.mount('#app');
  }
};

void initApp();
