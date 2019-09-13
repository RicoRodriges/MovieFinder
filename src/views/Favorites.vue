<template>
    <div class="favorites">
        <div class="alert alert-danger my-3 mx-2">
            This site does not store user data.<br/>
            The favorite list is not synchronized with other devices and
            will be irrevocably lost after browser data cleaning!
        </div>
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
