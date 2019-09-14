<template>
    <div>
        {{$t('movie.movieName')}}:
        <ItemSelector :onSearchChange="onSearchChange"
                      :changeDebounceTime="500"
                      :onSelect="onSelect"
                      :placeholder="$t('movie.placeholder')"
                      :emptyPlaceholder="$t('movie.emptyPlaceholder')"
                      :notFoundPlaceholder="$t('movie.notFoundPlaceholder')"
                      class="d-inline-block"
                      style="max-width: 600px;">
            <template v-slot:default="val">
                <div class="d-inline-block align-middle mr-2">
                    <img v-if="val.item.poster" class="option__image" :src="val.item.poster"
                         :alt="val.item.title">
                    <img v-else class="option__image" src="@/assets/no-movie.svg"
                         :alt="val.item.title">
                </div>
                <div class="option__desc d-inline-block align-middle">
                    <div class="option__title font-weight-bold h3">{{ val.item.title }}</div>
                    <div class="option__small text-muted">{{$t('general.popularity')}}: {{ val.item.popularity }}</div>
                </div>
            </template>
        </ItemSelector>
        <div v-if="selectedMovies.length > 0" class="my-3">
            <h5>{{$tc('movie.selectedNMovies', selectedMovies.length)}}:</h5>
            <div class="d-flex flex-row flex-wrap justify-content-around">
                <MovieView v-for="movie in selectedMovies" :key="movie.id" :movie="movie" @onDelete="onDelete" style="width:200px;"/>
            </div>
        </div>
        <div v-if="!isSearching && selectedMovies.length > 0">
            <button type="button" class="btn btn-success my-3" @click="startSearch">{{$t('general.startSearch')}}</button>
            <MovieTileList
                    :items="searchResult"
                    :pageSize="pageSize"
                    :page="currentPage"/>
        </div>
        <div v-if="isSearching">
            <CircleLoader/>
            {{$t('general.loading')}}
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import TMDBApi from '@/services/TMDBApi';
import ItemSelector from '@/components/ItemSelector.vue';
import CircleLoader from '@/components/CircleLoader.vue';
import MovieView from '@/components/models/Movie.vue';
import SearchService from '@/services/SearchService';
import MovieTile from '@/models/MovieTile';
import StorageService from '@/services/StorageService';
import MovieTileList from '@/components/MovieTileList.vue';
import Movie from '@/models/Movie';

@Component({
    components: {
        ItemSelector,
        MovieView,
        CircleLoader,
        MovieTileList,
    },
})
export default class SearchByMoviePage extends Vue {
    private readonly api = TMDBApi.getInstance();
    private readonly searchService = SearchService.getInstance();
    private readonly storageService = StorageService.getInstance();
    private selectedMovies: Movie[] = this.storageService.getMovieList();
    private isSearching = false;
    private searchResult: MovieTile[] = [];
    private pageSize = 9;
    private currentPage = 1;

    private async onSearchChange(text: string) {
        if (text.length === 0) {
            return [];
        } else {
            return (await this.api.searchMovie(text))
                .sort((a, b) => b.popularity - a.popularity);
        }
    }

    private onSelect(movie: Movie) {
        if (this.selectedMovies.map((m) => m.id).indexOf(movie.id) === -1) {
            this.selectedMovies.push(movie);
        }
    }

    private onDelete(movie: Movie) {
        this.selectedMovies = this.selectedMovies.filter((m) => m.id !== movie.id);
    }

    private startSearch() {
        if (!this.isSearching) {
            this.isSearching = true;
            this.searchResult = [];
            this.storageService.setMovieList(this.selectedMovies);
            this.searchService.searchMoviesByMovie(this.selectedMovies)
                .then((movieTiles) => {
                    this.searchResult = movieTiles;
                    this.currentPage = 1;
                    this.isSearching = false;
                });
        }
    }
}
</script>

<style scoped>
    .option__image {
        height: 120px;
    }
</style>
