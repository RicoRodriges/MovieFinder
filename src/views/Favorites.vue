<template>
    <div class="favorites">
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
export default class Home extends Vue {
    private favoriteMovies: MovieTile[] = StorageService.getInstance().getFavorites()
        .map((m) => new MovieTile(m, []));
    private pageSize = 9;
    private currentPage = 1;

}
</script>

<style>
</style>
