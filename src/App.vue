<template>
    <div id="app">
        <NavBar name="Movie finder"
                :current-page="currentPage.name"
                :pages="pages.map((p) => p.name)"
                @onChange="navigate"/>
        <div role="main" class="m-1">
            <keep-alive>
                <component :is="currentPage.component"/>
            </keep-alive>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import SearchByActorPage from '@/views/SearchByActorPage.vue';
import Favorites from '@/views/Favorites.vue';
import NavBar from '@/components/NavBar.vue';
import SearchByMoviePage from '@/views/SearchByMoviePage.vue';

@Component({
    components: {
        SearchByMoviePage,
        NavBar,
        SearchByActorPage,
        Favorites,
    },
})
export default class App extends Vue {
    private pages = [
        {name: 'Search by actors', component: SearchByActorPage},
        {name: 'Search by movies', component: SearchByMoviePage},
        {name: 'Favorite list', component: Favorites},
    ];
    private currentPage = this.pages[0];

    public navigate(pageName: string) {
        const page = this.pages.find((p) => p.name === pageName);
        if (page !== undefined) {
            this.currentPage = page;
        }
    }
}
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
</style>
