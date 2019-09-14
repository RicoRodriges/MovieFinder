<template>
    <div class="card mx-2">
        <div>
            <a :href="`https://www.themoviedb.org/movie/${movieTile.movie.id}?language=${$i18n.locale}`" target="_blank">
                <img v-if="movieTile.movie.poster" class="card-img-top m-auto d-inline-block w-auto"
                     :src="movieTile.movie.poster"
                     :alt="movieTile.movie.title">
                <img v-else class="card-img-top m-auto d-inline-block w-auto" src="@/assets/no-movie.svg"
                     :alt="movieTile.movie.title">
            </a>
        </div>
        <div class="card-body">
            <h5 class="card-title">{{movieTile.movie.title}}</h5>
            <div v-if="!showDetails" @click="showDetails = true" style="cursor: pointer">{{$t('general.showDetails')}}</div>
            <p v-else class="card-text">{{movieTile.movie.overview}}</p>
            <div v-if="movieTile.movie.releaseDate">
                {{$t('general.year')}}: ({{movieTile.movie.releaseDate.getFullYear()}})
            </div>
            <div>
                {{$t('movie.genres')}}:
                <span v-for="genre in movieTile.movie.genres" class="badge badge-secondary mr-1">{{genre.name}}</span>
            </div>
            <div>
                {{$t('general.vote')}}:
                <StarRating :count="10" :range="10" :score="movieTile.movie.voteAverage"/>
                ({{movieTile.movie.voteAverage}})
            </div>
            <div>
                {{$t('general.popularity')}}:
                <StarRating :count="10" :range="50" :score="movieTile.movie.popularity"/>
                ({{movieTile.movie.popularity}})
            </div>
            <div v-if="movieTile.people && movieTile.people.length > 0">
                {{$tc('actor.nActors', movieTile.people.length)}}: {{movieTile.people.map((p) => p.name).slice(0, 4).join(', ')}}
                <span v-if="movieTile.people.length > 4"> {{$t('general.andOthers')}}</span>
            </div>
            <div v-if="movieTile.movies && movieTile.movies.length > 0">
                {{$t('general.recommended')}} {{$tc('general.nTimes', movieTile.movies.length)}}
            </div>
            <button v-if="!storageService.isFavorite(movieTile.movie.id)"
                    @click="addToFavorite(movieTile)"
                    type="button" class="btn btn-outline-primary my-2">
                {{$t('favorite.add')}}
            </button>
            <button v-else
                    @click="removeFromFavorite(movieTile)"
                    type="button" class="btn btn-outline-danger my-2">
                {{$t('favorite.remove')}}
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import MovieTile from '@/models/MovieTile';
import StarRating from '@/components/StarRating.vue';
import StorageService from '@/services/StorageService';

@Component({
    components: {
        StarRating,
    },
})
export default class MovieTileView extends Vue {
    @Prop() private movieTile!: MovieTile;
    private showDetails = false;
    private storageService = StorageService.getInstance();

    public addToFavorite(tile: MovieTile) {
        this.storageService.addToFavorite(tile.movie);
        this.$forceUpdate();
    }

    public removeFromFavorite(tile: MovieTile) {
        this.storageService.removeFromFavorite(tile.movie.id);
        this.$forceUpdate();
    }
}
</script>

<style scoped>
    .card-img-top {
        max-height: 300px;
    }
</style>
