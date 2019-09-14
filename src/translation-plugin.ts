import Vue from 'vue';
import VueI18n from 'vue-i18n';
import translation from './translation';

VueI18n.prototype.getChoiceIndex = function(choice, choicesLength) {
    switch (this.locale) {
        case 'ru': {
            if (choice === 0) {
                return 0;
            }
            const teen = choice > 10 && choice < 20;
            const endsWithOne = choice % 10 === 1;
            if (!teen && endsWithOne) {
                return 1;
            }
            if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
                return 2;
            }
            return (choicesLength < 4) ? 2 : 3;
        }
        default: {
            if (choice > 2) {
                return 2;
            } else if (choice === 1) {
                return 1;
            }
            return 0;
        }
    }
};

Vue.use(VueI18n);

export default new VueI18n({
    locale: 'ru',
    fallbackLocale: 'en',
    messages: translation,
});
