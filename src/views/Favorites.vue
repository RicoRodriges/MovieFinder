<template>
    <div class="favorites">
        <div class="alert alert-danger my-3 mx-2" v-html="$t('message.cache_warning')"></div>
        <MovieTileList
                :items="favoriteMovies"
                :pageSize="pageSize"
                :page="currentPage"/>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import StorageService from '@/services/StorageService';
import MovieTileList from '@/components/MovieTileList.vue';
import MovieTile from '@/models/MovieTile';

@Component({
    components: {
        MovieTileList,
    },
})
export default class Favorites extends Vue {
    private favoriteMovies: MovieTile[] = StorageService.getInstance().getFavorites()
        .map((m) => new MovieTile(m, []));
    private pageSize = 9;
    private currentPage = 1;

}
</script>

<style>
</style>
