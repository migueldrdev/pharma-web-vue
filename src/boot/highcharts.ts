import { boot } from 'quasar/wrappers';
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';

export default boot(({ app }) => {
  app.use(HighchartsVue, { highcharts: Highcharts });
});
