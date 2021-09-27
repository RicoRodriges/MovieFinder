<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="/">{{ $t(siteName) }}</a>
        <button class="navbar-toggler" type="button" @click="showMenu = !showMenu">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" :class="{ show: showMenu }">
            <ul class="navbar-nav mr-auto">
                <li
                    v-for="pageName in pages"
                    :key="pageName"
                    class="nav-item mr-2" :class="{ active: pageName === currentPage }"
                >
                    <a
                        class="nav-link" :class="{ disabled: pageName === currentPage }"
                        href="#"
                        @click.prevent="onChange(pageName)"
                    >
                        {{ $t(pageName) }}
                    </a>
                </li>
            </ul>
            <div class="d-inline-block">
                <img
                    src="@/assets/en.svg"
                    class="flag mx-2"
                    alt="en"
                    title="English"
                    @click="changeLocale('en')"
                />
                <img
                    src="@/assets/ru.svg"
                    class="flag mx-2"
                    alt="ru"
                    title="Русский"
                    @click="changeLocale('ru')"
                />
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';
import { Language } from '@/models/Language';
import { generalModule } from '@/store/general-module';

@Component
export default class NavBar extends Vue {
    @Prop() private siteName!: string;

    @Prop() private pages!: string[];

    @Prop() private currentPage!: string;

    private showMenu = false;

    @Emit('onChange')
    public onChange(pageName: string) {}

    private changeLocale(l: Language) {
      generalModule.mutations.changeLocale(l);
    }
}
</script>

<style scoped>
.flag {
    width: 2rem;
    cursor: pointer;
}
</style>
