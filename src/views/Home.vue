<template>
    <div class="home">
        <ItemSelector :onSearchChange="onSearchChange"
                      :onSelect="onSelect"
                      placeholder="Input actor name"
                      emptyPlaceholder="Start writing actor name"
                      notFoundPlaceholder="Actors were not found">
            <template v-slot:default="val">
                <img v-if="val.item.poster" class="option__image d-inline-block align-middle" :src="val.item.poster"
                     :alt="val.item.name">
                <img v-else class="option__image d-inline-block align-middle" src="@/assets/no-person.png"
                     :alt="val.item.name">
                <div class="option__desc d-inline-block align-middle">
                    <div class="option__title font-weight-bold h3">{{ val.item.name }}</div>
                    <div class="option__small text-muted">Популярность: {{ val.item.popularity }}</div>
                </div>
            </template>
        </ItemSelector>
        <h5>Selected actors:</h5>
        <div class="d-flex flex-row flex-wrap justify-content-around">
            <PersonView v-for="person in selectedActors" :person="person" @onDelete="onDelete" style="width:200px;"/>
        </div>
        <div v-if="!isSearching">
            <button type="button" class="btn btn-success" @click="startSearch">Start search</button>
        </div>
        <div v-else>
            <CircleLoader />
            Loading...
        </div>
        <div class="d-flex flex-row flex-wrap justify-content-around">
            <FilmTileView v-for="filmTile in searchResult" :filmTile="filmTile" style="width: 500px;" class="mt-3" />
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import TMDBApi from '@/services/TMDBApi';
import ItemSelector from '@/components/ItemSelector.vue';
import CircleLoader from '@/components/CircleLoader.vue';
import Person from '@/models/Person';
import PersonView from '@/components/models/Person';
import SearchService from '@/services/SearchService';
import FilmTile from '@/models/FilmTile';
import FilmTileView from '@/components/models/FilmTile';

@Component({
    components: {
        ItemSelector,
        PersonView,
        FilmTileView,
        CircleLoader,
    },
})
export default class Home extends Vue {
    private readonly api = new TMDBApi();
    private readonly searchService = new SearchService();
    private selectedActors: Person[] = [];
    private isSearching = false;
    private searchResult: FilmTile[] = [];

    private async onSearchChange(text: string) {
        if (text.length === 0) {
            return [];
        } else {
            return await this.api.findPeople(text);
        }
    }

    private onSelect(person: Person) {
        if (this.selectedActors.map((p) => p.id).indexOf(person.id) === -1) {
            this.selectedActors.push(person);
        }
    }

    private onDelete(person: Person) {
        this.selectedActors = this.selectedActors.filter((p) => p.id !== person.id);
    }

    private startSearch() {
        if (!this.isSearching) {
            this.isSearching = true;
            this.searchResult = [];
            this.searchService.searchFilms(this.selectedActors)
                .then((filmTiles) => {
                    this.searchResult = filmTiles;
                    this.isSearching = false;
                });
        }
    }

}
</script>

<style>
    .option__image {
        max-height: 120px;
    }
</style>
