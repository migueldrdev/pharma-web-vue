import { boot } from 'quasar/wrappers';
import permissionDirective from '@/directives/permission';

export default boot(({ app }) => {
  app.directive('permission', permissionDirective);
});
