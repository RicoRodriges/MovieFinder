<template>
    <div>
        {{$t('movie.movieName')}}:
        <ItemSelector :suggest="suggest"
                      :changeDebounceTime="500"
                      @onSelect="onSelect"
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
        <div class="my-1 text-center">
            <button v-if="value.length > 0" type="button" class="btn btn-danger d-inline-block mx-2" @click="onClear">
                {{$t('movie.clearList')}}
            </button>
            <button v-if="setActions && movieSet.length > 0" type="button" class="btn btn-success d-inline-block mx-2" @click="onAppendFromSet">
                {{$t('movie.appendToList')}}
            </button>
            <button v-if="setActions && value.length > 0" type="button" class="btn btn-success d-inline-block mx-2" @click="onAppendToSet">
                {{$t('movie.appendToSet')}}
            </button>
        </div>
        <div v-if="value.length > 0" class="my-3">
            <h5>{{$tc('movie.selectedNMovies', value.length)}}:</h5>
            <div class="d-flex flex-row flex-wrap justify-content-around">
                <MovieView v-for="movie in value" :key="movie.id" :movie="movie" @onDelete="onDelete" style="width:200px;"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { tmdbApi } from '@/api/tmdb';
import MovieView from '@/components/models/Movie.vue';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import { generalModule } from '@/store/general-module';
import { movieSetModule } from "@/store/movie-set-module";
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import ItemSelector from './ItemSelector.vue';

@Component({
    components: {
        ItemSelector,
        MovieView,
    },
})
export default class MovieSelector extends Vue {
    @Prop() private value !: Movie[];
    @Prop() private setActions !: boolean;
    private readonly api = tmdbApi;

    private get lang(): Language {
        return generalModule.state.lang;
    }

    private get movieSet(): Movie[] {
        return movieSetModule.state.selectedMovies;
    }

    private async suggest(text: string): Promise<Movie[]> {
        if (text.length === 0) {
            return [];
        } else {
            return (await this.api.searchMovie(text, this.lang))
                .map(m => m.toMovie())
                .sort((m, b) => b.popularity - m.popularity);
        }
    }

    @Emit('input')
    private input(movies: Movie[]) {
        return;
    }

    private onSelect(movie: Movie) {
        const m = this.value.find(v => v.id === movie.id);
        if (m === undefined) {
            this.input([...this.value, movie]);
        }
    }

    private onDelete(movie: Movie) {
        const m = this.value.find(v => v.id === movie.id);
        if (m !== undefined) {
            this.input(this.value.filter(v => v.id !== movie.id));
        }
    }

    private onClear() {
        if (this.value.length > 0) {
            this.input([]);
        }
    }

    private onAppendFromSet() {
        const movies = [...this.value];
        for (const m of this.movieSet) {
            const movie = movies.find(v => v.id === m.id);
            if (movie === undefined) {
                movies.push(m);
            }
        }
        if (this.value.length !== movies.length) {
            this.input(movies);
        }
    }

    private onAppendToSet() {
        const movies = [...this.movieSet];
        for (const m of this.value) {
            const movie = movies.find(v => v.id === m.id);
            if (movie === undefined) {
                movies.push(m);
            }
        }
        if (this.movieSet.length !== movies.length) {
            movieSetModule.mutations.setMovies(movies);
        }
    }
}
</script>

<style scoped>
    .option__image {
        height: 120px;
    }
</style>
