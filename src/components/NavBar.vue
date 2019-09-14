<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="/">{{$t(siteName)}}</a>
        <button class="navbar-toggler" type="button" @click="showMenu = !showMenu">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div :class="'collapse navbar-collapse' + (showMenu ? ' show' : '')">
            <ul class="navbar-nav mr-auto">
                <li v-for="pageName in pages"
                    :class="'nav-item mr-2' + (pageName === currentPage ? ' active' : '')">
                    <a :class="'nav-link' + (pageName === currentPage ? ' disabled' : '')" href="#"
                       @click.prevent="onChange(pageName)">{{$t(pageName)}}</a>
                </li>
            </ul>
            <div class="d-inline-block">
                <img src="@/assets/en.svg" class="flag mx-2" alt="en" title="English" @click="setLocale('en', $i18n)">
                <img src="@/assets/ru.svg" class="flag mx-2" alt="ru" title="Русский" @click="setLocale('ru', $i18n)">
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator';
import {setLocale} from '@/translation-plugin';

@Component
export default class NavBar extends Vue {
    @Prop() private siteName !: string;
    @Prop() private pages !: string[];
    @Prop() private currentPage !: string;
    private showMenu = false;

    @Emit('onChange')
    public onChange(pageName: string) {
        // emit
    }

    private setLocale(l: string, i18n: any) {
        setLocale(l, i18n);
    }
}
</script>

<style scoped>
    .flag {
        width: 2rem;
        cursor: pointer;
    }
</style>
