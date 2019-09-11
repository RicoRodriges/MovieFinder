<template>
    <div class="card mx-2">
        <div>
            <a :href="`https://www.themoviedb.org/movie/${movieTile.movie.id}?language=ru-RU`" target="_blank">
                <img v-if="movieTile.movie.poster" class="card-img-top m-auto d-inline-block w-auto"
                     :src="movieTile.movie.poster"
                     :alt="movieTile.movie.title">
                <img v-else class="card-img-top m-auto d-inline-block w-auto" src="@/assets/no-person.png"
                     :alt="movieTile.movie.title">
            </a>
        </div>
        <div class="card-body">
            <h5 class="card-title">{{movieTile.movie.title}}</h5>
            <div v-if="!showDetails" @click="showDetails = true" style="cursor: pointer">Show details...</div>
            <p v-else class="card-text">{{movieTile.movie.overview}}</p>
        </div>
        <div>
            Year: ({{movieTile.movie.releaseDate.getFullYear()}})
        </div>
        <div>
            Genres:
            <span v-for="genre in movieTile.movie.genres" class="badge badge-secondary mr-1">{{genre.name}}</span>
        </div>
        <div>
            Vote:
            <StarRating :count="10" :range="10" :score="movieTile.movie.voteAverage"/>
            ({{movieTile.movie.voteAverage}})
        </div>
        <div>
            Popularity:
            <StarRating :count="10" :range="50" :score="movieTile.movie.popularity"/>
            ({{movieTile.movie.popularity}})
        </div>
        <div>
            {{movieTile.people.length}} Actor(s): {{movieTile.people.map((p) => p.name).slice(0, 4).join(', ')}}<span
                v-if="movieTile.people.length > 4">, and other</span>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import MovieTile from '@/models/MovieTile';
import StarRating from '@/components/StarRating.vue';

@Component({
    components: {
        StarRating,
    },
})
export default class MovieTileView extends Vue {
    @Prop() private movieTile!: MovieTile;
    private showDetails = false;
}
</script>

<style scoped>
    .card-img-top {
        max-height: 300px;
    }
</style>
