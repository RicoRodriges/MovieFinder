<template>
    <div>
        <MovieSelector v-model="selectedMovies" :setActions="true"/>
        <div v-if="!isSearching && selectedMovies.length > 0">
            <div>
                <button type="button" class="btn btn-success m-3" @click="startSearch">
                    {{$t('general.startSearch')}}
                </button>
            </div>
            <MovieFilters v-if="allRecommendations.length > 0" v-model="filter" :genres="genres" :yearRange="yearRange" :sortOptions="sortOptions" />
            <PageableList
                    v-if="recommendations.length > 0"
                    :items="sortedRecommendations"
                    :pageSize="pageSize"
                    :page="currentPage"
                    @onPageChange="onPageChange">
                <template slot-scope="props">
                    <MovieTileView :movie="props.item[1]" style="width: 500px;" class="mt-3">
                        <div>
                            {{$t('general.recommended')}} {{$tc('general.nTimes', props.item[0].length)}}
                        </div>
                    </MovieTileView>
                </template>
            </PageableList>
        </div>
        <div v-if="isSearching">
            <CircleLoader/>
            {{$t('general.loading')}}
        </div>
    </div>
</template>

<script lang="ts">
import { GenreId } from '@/api/tmdb/TMDBGenre';
import CircleLoader from '@/components/CircleLoader.vue';
import MovieFilters, { Filters } from '@/components/filters/MovieFilters.vue';
import MovieTileView from '@/components/models/MovieTile.vue';
import PageableList from '@/components/pageable/PageableList.vue';
import MovieSelector from '@/components/selectors/MovieSelector.vue';
import Genre from '@/models/Genre';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import { tmdbRecommendator } from '@/services/TMDBRecommendator';
import { generalModule } from '@/store/general-module';
import { movieSetModule } from '@/store/movie-set-module';
import { moviesByMoviesModule } from '@/store/movies-by-movies-module';
import multiSort from '@/utils/sort';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
        MovieSelector,
        CircleLoader,
        MovieTileView,
        PageableList,
        MovieFilters,
    },
})
export default class SearchByMoviePage extends Vue {
    private readonly recommender = tmdbRecommendator;
    private isSearching = false;
    private pageSize = 9;
    private currentPage = 1;

    private readonly sortOptions = [
        {id: 'popularity', n: 'general.popularity'},
        {id: 'voteAverage', n: 'general.vote'},
        {id: 'releaseDate', n: 'general.year'},
    ];

    private filter: Filters = {
        excludeMoviesFromSet: false,
        excludedGenres: [],
        years: null,
        sort: this.sortOptions[0].id,
    };

    private get selectedMovies(): Movie[] {
        return moviesByMoviesModule.state.selectedMovies;
    }

    private set selectedMovies(v: Movie[]) {
        moviesByMoviesModule.mutations.setMovies(v);
    }

    private get allRecommendations(): Array<[Movie[], Movie]> {
        return moviesByMoviesModule.state.movies;
    }
    private set allRecommendations(v: Array<[Movie[], Movie]>) {
        moviesByMoviesModule.mutations.recommend(v);
        this.currentPage = 1;
        this.resetFilter();
    }

    private get recommendations(): Array<[Movie[], Movie]> {
        let values = this.allRecommendations;
        if (values.length === 0) return values;

        if (this.filter.excludeMoviesFromSet && this.movieSet.length > 0) {
            const excludedIds = new Set(this.movieSet.map(m => m.id));
            values = values.filter(m => !excludedIds.has(m[1].id));
        }
        if (this.filter.excludedGenres.length > 0) {
            const excludedGenres = new Set(this.filter.excludedGenres.map(g => g.id));
            values = values.filter(m => m[1].genres.every(g => !excludedGenres.has(g.id)));
        }
        if (this.filter.years !== null) {
            const [start, end] = this.filter.years;
            const dateFilter = (d: Date) => (start === null || d.getFullYear() >= start) && (end === null || d.getFullYear() <= end);
            values = values.filter(m => m[1].releaseDate === undefined || dateFilter(m[1].releaseDate));
        }

        return values;
    }

    private get sortedRecommendations(): Array<[Movie[], Movie]> {
        return multiSort([...this.recommendations], '0.length:desc', `1.${this.filter.sort}:desc`);
    }

    private get genres(): Genre[] {
        const genres = new Map<GenreId, Genre>();
        for (const r of this.allRecommendations) {
            for (const genre of r[1].genres) {
                genres.set(genre.id, genre);
            }
        }
        return [...genres.values()].sort((a, b) => a.name.localeCompare(b.name));
    }

    private get yearRange(): [number, number] {
        let max = 1400;
        let min = 9000;
        for (const r of this.allRecommendations) {
            const year = r[1].releaseDate?.getFullYear();
            if (year !== undefined) {
                max = year > max ? year : max;
                min = year < min ? year : min;
            }
        }
        return [min, max];
    }

    private get lang(): Language {
        return generalModule.state.lang;
    }

    private get movieSet(): Movie[] {
        return movieSetModule.state.selectedMovies;
    }

    private onPageChange(page: number) {
        this.currentPage = page;
    }

    private async startSearch() {
        if (!this.isSearching) {
            try {
                this.isSearching = true;

                // TODO: reimplement as async action with progress
                this.allRecommendations = await this.recommender.recommendMoviesByMovies(new Set(this.selectedMovies), this.lang);
            } finally {
                this.isSearching = false;
            }
        }
    }

    private resetFilter() {
        this.filter.excludeMoviesFromSet = false;
        this.filter.excludedGenres = [];
        this.filter.years = null;
    }
}
</script>

<style scoped>
    .option__image {
        height: 120px;
    }
</style>
