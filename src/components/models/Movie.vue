<template>
    <div class="card m-2">
        <button
            type="button"
            class="close position-absolute p-2"
            style="top: 0; right: 0;"
            @click="onDelete(movie)"
        >
            <span>&times;</span>
        </button>
        <div>
            <a :href="getUrl(movie.id)" target="_blank">
                <img
                    v-if="movie.poster"
                    class="card-img-top m-auto d-inline-block w-auto"
                    :src="movie.poster"
                    :alt="movie.title"
                />
                <img
                    v-else
                    class="card-img-top m-auto d-inline-block w-auto"
                    src="@/assets/no-movie.svg"
                    :alt="movie.title"
                />
            </a>
        </div>
        <div class="card-body">
            <p class="card-text">{{ movie.title }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';
import { tmdbApi } from '@/api/tmdb';
import { MovieId } from '@/api/tmdb/TMDBMovie';
import { Language } from '@/models/Language';
import MovieModel from '@/models/Movie';
import { generalModule } from '@/store/general-module';

@Component
export default class Movie extends Vue {
    private readonly api = tmdbApi;

    @Prop() private movie!: MovieModel;

    private get lang(): Language {
      return generalModule.state.lang;
    }

    private getUrl(id: MovieId): URL {
      return this.api.getMovieUrl(id, this.lang);
    }

    @Emit('onDelete')
    private onDelete(item: MovieModel) {}
}
</script>

<style scoped>
.card-img-top {
    max-height: 200px;
}
</style>
