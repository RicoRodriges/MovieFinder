<template>
    <div class="card m-2">
        <button type="button" class="close position-absolute p-2" style="top: 0; right: 0;" @click="onDelete(movie)">
            <span>&times;</span>
        </button>
        <div>
            <a :href="`https://www.themoviedb.org/movie/${movie.id}?language=${$i18n.locale}`" target="_blank">
                <img v-if="movie.poster" class="card-img-top m-auto d-inline-block w-auto" :src="movie.poster"
                     :alt="movie.title">
                <img v-else class="card-img-top m-auto d-inline-block w-auto" src="@/assets/no-person.png"
                     :alt="movie.title">
            </a>
        </div>
        <div class="card-body">
            <p class="card-text">{{movie.title}}</p>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator';
import MovieModel from '@/models/Movie';

@Component
export default class Movie extends Vue {
    @Prop() private movie!: MovieModel;

    @Emit('onDelete')
    private onDelete(item: MovieModel) {
        return;
    }
}
</script>

<style scoped>
    .card-img-top {
        max-height: 200px;
    }
</style>
