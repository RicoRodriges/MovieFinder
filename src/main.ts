import Vue from 'vue';
import i18n from './translation';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.config.productionTip = false;

new Vue({
    i18n,
    render: (h) => h(App),
}).$mount('#app');
