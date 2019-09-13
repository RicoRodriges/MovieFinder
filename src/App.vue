<template>
    <div id="app">
        <NavBar name="Movie finder"
                :current-page="currentPage"
                :pages="pages"
                @onChange="navigate"/>
        <Home v-if="currentPage === 'Search page'"/>
        <Favorites v-if="currentPage === 'Favorite list'"/>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import Home from '@/views/Home.vue';
import Favorites from '@/views/Favorites.vue';
import NavBar from '@/components/NavBar.vue';

@Component({
    components: {
        NavBar,
        Home,
        Favorites,
    },
})
export default class App extends Vue {
    private pages = ['Search page', 'Favorite list'];
    private currentPage = this.pages[0];

    public navigate(pageName: string) {
        this.currentPage = pageName;
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
