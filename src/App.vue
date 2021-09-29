<template>
    <div id="app">
        <NavBar :siteName="siteName"
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
import { Component, Vue } from 'vue-property-decorator';
import NavBar from '@/components/NavBar.vue';
import ActorSetPage from '@/views/ActorSetPage.vue';
import MovieSetPage from '@/views/MovieSetPage.vue';
import SearchActorsByMoviePage from '@/views/SearchActorsByMoviePage.vue';
import SearchByActorPage from '@/views/SearchByActorPage.vue';
import SearchByMoviePage from '@/views/SearchByMoviePage.vue';

@Component({
  components: {
    SearchByMoviePage,
    NavBar,
    SearchByActorPage,
    MovieSetPage,
    ActorSetPage,
    SearchActorsByMoviePage,
  },
})
export default class App extends Vue {
    private pages = [
      { name: 'pages.searchByActors', component: SearchByActorPage },
      { name: 'pages.searchByMovies', component: SearchByMoviePage },
      { name: 'pages.searchActorsByMovies', component: SearchActorsByMoviePage },
      { name: 'pages.actorSet', component: ActorSetPage },
      { name: 'pages.movieSet', component: MovieSetPage },
    ];

    private currentPage = this.pages[0];

    private siteName = 'siteName';

    public navigate(pageName: string): void {
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
