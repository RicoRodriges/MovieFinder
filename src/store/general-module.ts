import { Language } from '@/models/Language';
import l, { setLocale } from "@/translation";
import { createModule } from "vuexok";
import store from ".";

export const generalModule = createModule("general", {
    state: {
        lang: l.locale as Language,
    },
    mutations: {
        changeLocale(state, lang: Language) {
            setLocale(lang, l);
            state.lang = lang;
        }
    }
});

generalModule.register(store);