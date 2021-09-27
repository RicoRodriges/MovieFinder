<template>
    <div class="card mx-2">
        <div>
            <a :href="getUrl(movie.id)" target="_blank">
                <img v-if="movie.poster" class="card-img-top m-auto d-inline-block w-auto"
                     :src="movie.poster"
                     :alt="movie.title">
                <img v-else class="card-img-top m-auto d-inline-block w-auto" src="@/assets/no-movie.svg"
                     :alt="movie.title">
            </a>
        </div>
        <div class="card-body">
            <h5 class="card-title">{{movie.title}}</h5>
            <div v-if="!showDetails" @click="showDetails = true" style="cursor: pointer">{{$t('general.showDetails')}}</div>
            <p v-else class="card-text">{{movie.overview}}</p>
            <div v-if="movie.releaseDate">
                {{$t('general.year')}}: ({{movie.releaseDate.getFullYear()}})
            </div>
            <div>
                {{$t('movie.genres')}}:
                <span v-for="genre in movie.genres" :key="genre.id" class="badge badge-secondary mr-1">{{genre.name}}</span>
            </div>
            <div>
                {{$t('general.vote')}}:
                <StarRating :count="10" :range="10" :score="movie.voteAverage"/>
                ({{movie.voteAverage}})
            </div>
            <div>
                {{$t('general.popularity')}}:
                <StarRating :count="10" :range="50" :score="movie.popularity"/>
                ({{movie.popularity}})
            </div>
            <slot></slot>
            <div class="my-2">
                <button v-if="!isinMovieSet"
                        @click="addToSet"
                        type="button" class="btn btn-outline-primary my-1 mx-auto d-block">
                    {{$t('set.add')}}
                </button>
                <button v-else
                        @click="removeFromSet"
                        type="button" class="btn btn-outline-danger my-1 mx-auto d-block">
                    {{$t('set.remove')}}
                </button>
                <a :href="`https://youtube.com/results?search_query=${encodeURIComponent(movie.title + ' ' + $t('movie.trailer'))}`"
                   target="_blank"
                   class="btn btn-outline-primary my-1">
                    {{$t('movie.findTrailer')}}
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { tmdbApi } from '@/api/tmdb';
import { MovieId } from '@/api/tmdb/TMDBMovie';
import StarRating from '@/components/StarRating.vue';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import { generalModule } from '@/store/general-module';
import { movieSetModule } from '@/store/movie-set-module';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    components: {
        StarRating,
    },
})
export default class MovieTileView extends Vue {
    private readonly api = tmdbApi;
    @Prop() private movie!: Movie;
    private showDetails = false;

    private get lang(): Language {
        return generalModule.state.lang;
    }

    private get movieSet(): Movie[] {
        return movieSetModule.state.selectedMovies;
    }

    private get isinMovieSet() {
        const m = this.movieSet.find(v => v.id === this.movie.id);
        return m !== undefined;
    }

    private addToSet() {
        if (!this.isinMovieSet) {
            movieSetModule.mutations.setMovies([...this.movieSet, this.movie]);
        }
    }

    private removeFromSet() {
        if (this.isinMovieSet) {
            movieSetModule.mutations.setMovies(this.movieSet.filter(m => m.id !== this.movie.id));
        }
    }

    private getUrl(id: MovieId): URL {
        return this.api.getMovieUrl(id, this.lang);
    }
}
</script>

<style scoped>
    .card-img-top {
        max-height: 300px;
    }
</style>
