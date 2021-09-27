import { Language } from '@/models/Language';
import { getCookie, setCookie } from '@/utils/cookie';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import translation from './translation';

VueI18n.prototype.getChoiceIndex = function (choice, choicesLength) {
    switch (this.locale) {
        case Language.RU: {
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
            if (choice >= 2) {
                return 2;
            } else if (choice === 1) {
                return 1;
            }
            return 0;
        }
    }
};

const COOKIE_NAME = 'lang';

function detectLocale(): Language {
    let locale: Language | undefined = undefined;

    const availableLocales = Object.keys(translation) as Language[];

    const cookie = getCookie(COOKIE_NAME);
    if (cookie) {
        locale = findLocale(availableLocales, cookie);
    }
    if (locale === undefined) {
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
    return locale === undefined ? Language.EN : locale;
}

function findLocale(availableLocales: Language[], language: string) {
    return availableLocales.find(l => language.startsWith(l));
}

export function setLocale(l: Language, i18n: VueI18n) {
    setCookie(COOKIE_NAME, l, { 'max-age': 3600 * 24 * 30 });
    i18n.locale = l;
}

Vue.use(VueI18n);

export default new VueI18n({
    locale: detectLocale(),
    fallbackLocale: Language.EN,
    messages: translation,
});
