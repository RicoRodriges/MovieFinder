import Vue from 'vue';
import i18n from './translation-plugin';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.css';

Vue.config.productionTip = false;

new Vue({
    i18n,
    render: (h) => h(App),
}).$mount('#app');
