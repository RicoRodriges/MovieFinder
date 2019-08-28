<template>
    <div class="card mx-2">
        <div>
            <a :href="`https://www.themoviedb.org/movie/${filmTile.film.id}?language=ru-RU`" target="_blank">
                <img v-if="filmTile.film.poster" class="card-img-top m-auto d-inline-block w-auto"
                     :src="filmTile.film.poster"
                     :alt="filmTile.film.title">
                <img v-else class="card-img-top m-auto d-inline-block w-auto" src="@/assets/no-person.png"
                     :alt="filmTile.film.title">
            </a>
        </div>
        <div class="card-body">
            <h5 class="card-title">{{filmTile.film.title}}</h5>
            <div v-if="!showDetails" @click="showDetails = true" style="cursor: pointer">Show details...</div>
            <p v-else class="card-text">{{filmTile.film.overview}}</p>
        </div>
        <div>
            Year: ({{filmTile.film.releaseDate.getFullYear()}})
        </div>
        <div>
            Vote:
            <StarRating :count="10" :range="10" :score="filmTile.film.voteAverage"/>
            ({{filmTile.film.voteAverage}})
        </div>
        <div>
            Popularity:
            <StarRating :count="10" :range="50" :score="filmTile.film.popularity"/>
            ({{filmTile.film.popularity}})
        </div>
        <div>
            {{filmTile.people.length}} Actor(s): {{filmTile.people.map((p) => p.name).slice(0, 4).join(', ')}}<span
                v-if="filmTile.people.length > 4">, and other</span>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import FilmTile from "@/models/FilmTile";
    import StarRating from "@/components/StarRating.vue";

    @Component({
        components: {
            StarRating,
        },
    })
    export default class Person extends Vue {
        @Prop() private filmTile!: FilmTile;
        private showDetails = false;
    }
</script>

<style scoped>
    .card-img-top {
        max-height: 300px;
    }
</style>
