import Vue from 'vue';
import VueI18n from 'vue-i18n';
import translation from './translation';
import {getCookie, setCookie} from '@/utils/Cookies';

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

let locale: string;

export function getLocale() {
    if (locale === undefined) {
        const cookie = getCookie('lang');
        if (cookie) {
            locale = cookie;
        } else {
            const availableLocales = Object.keys(translation);
            if (window.navigator.languages) {
                for (const language of window.navigator.languages) {
                    const foundedLocale = findLocale(availableLocales, language);
                    if (foundedLocale) {
                        locale = foundedLocale;
                        break;
                    }
                }
            } else {
                const foundedLocale = findLocale(availableLocales,
                    (window.navigator as any).userLanguage || window.navigator.language);
                if (foundedLocale) {
                    locale = foundedLocale;
                }
            }
        }
        if (locale === undefined) {
            locale = 'ru';
        }
    }
    return locale;
}

function findLocale(availableLocales: string[], language: string) {
    return availableLocales.find((l) => language.startsWith(l));
}

export function setLocale(l: string, i18n: VueI18n) {
    locale = l;
    setCookie('lang', l, {'max-age': 3600 * 24 * 30});
    i18n.locale = l;
}

export default new VueI18n({
    locale: getLocale(),
    fallbackLocale: 'en',
    messages: translation,
});
