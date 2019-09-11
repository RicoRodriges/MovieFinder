<template>
    <div class="home">
        <ItemSelector :onSearchChange="onSearchChange"
                      :changeDebounceTime="500"
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
            <CircleLoader/>
            Loading...
        </div>
        <div class="my-2 pagination-top">
            <Paginator v-if="searchResult.length > 0"
                       :displayCount="5"
                       :pageCount="Math.ceil(searchResult.length / pageSize)"
                       :currentPage="currentPage"
                       @onChange="onPageChange"
                       class="d-inline-block m-auto"/>
        </div>
        <div v-if="searchResult.length > 0">
            Sort by:
            <select v-model="sortField" class="form-control form-control-sm d-inline ml-2" style="max-width: 130px;">
                <option value="" disabled>Choose options...</option>
                <option value="popularity">Popularity</option>
                <option value="voteAverage">Vote</option>
            </select>
        </div>
        <div v-if="searchResult.length > 0" class="d-flex flex-row flex-wrap justify-content-around">
            <MovieTileView
                    v-for="i in range(pageSize*(currentPage - 1), Math.min(searchResult.length, pageSize*currentPage) - 1)"
                    :movieTile="sortedSearchResult[i]"
                    style="width: 500px;" class="mt-3"/>
        </div>
        <div class="my-2">
            <Paginator
                    :displayCount="5"
                    :pageCount="Math.ceil(searchResult.length / pageSize)"
                    :currentPage="currentPage"
                    @onChange="onPageChange"
                    class="d-inline-block m-auto"/>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import TMDBApi from '@/services/TMDBApi';
import ItemSelector from '@/components/ItemSelector.vue';
import CircleLoader from '@/components/CircleLoader.vue';
import Person from '@/models/Person';
import PersonView from '@/components/models/Person.vue';
import SearchService from '@/services/SearchService';
import MovieTile from '@/models/MovieTile';
import MovieTileView from '@/components/models/MovieTile.vue';
import Paginator from '@/components/Paginator.vue';
import multiSort from '@/utils/Sorting';

@Component({
    components: {
        ItemSelector,
        PersonView,
        MovieTileView,
        CircleLoader,
        Paginator,
    },
})
export default class Home extends Vue {
    private readonly api = TMDBApi.getInstance();
    private readonly searchService = SearchService.getInstance();
    private selectedActors: Person[] = [];
    private isSearching = false;
    private searchResult: MovieTile[] = [];
    private pageSize = 9;
    private currentPage = 1;
    private sortField = 'popularity';

    get sortedSearchResult() {
        return multiSort(this.searchResult, 'people.length:desc', `movie.${this.sortField}:desc`);
    }

    private async onSearchChange(text: string) {
        if (text.length === 0) {
            return [];
        } else {
            return await this.api.searchPerson(text);
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

    private onPageChange(page: number) {
        const container = this.$el.querySelector('.pagination-top');
        if (container) {
            container.scrollIntoView({block: 'nearest', behavior: 'instant'} as any);
        }
        this.currentPage = page;
    }

    private startSearch() {
        if (!this.isSearching) {
            this.isSearching = true;
            this.searchResult = [];
            this.searchService.searchMovies(this.selectedActors)
                .then((movieTiles) => {
                    this.searchResult = movieTiles;
                    this.currentPage = 1;
                    this.isSearching = false;
                });
        }
    }

    private range(start: number, end: number) {
        const res = [];
        for (let i = start; i <= end; i++) {
            res.push(i);
        }
        return res;
    }

}
</script>

<style>
    .option__image {
        max-height: 120px;
    }
</style>
