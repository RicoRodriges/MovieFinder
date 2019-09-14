<template>
    <div v-if="items.length > 0">
        <div class="my-2 pagination-top">
            <Paginator :displayCount="5"
                       :pageCount="Math.ceil(items.length / pageSize)"
                       :currentPage="currentPage"
                       @onChange="onPageChange"
                       class="d-inline-block m-auto"/>
        </div>
        <div>
            {{$t('general.sortBy')}}
            <select v-model="sortField" class="form-control form-control-sm d-inline ml-2" style="max-width: 130px;">
                <option value="" disabled>{{$t('general.chooseOptions')}}</option>
                <option value="popularity">{{$t('general.popularity')}}</option>
                <option value="voteAverage">{{$t('general.vote')}}</option>
            </select>
        </div>
        <div class="d-flex flex-row flex-wrap justify-content-around">
            <MovieTileView
                    v-for="i in range(pageSize*(currentPage - 1), Math.min(items.length, pageSize*currentPage) - 1)"
                    :key="sortedItems[i].movie.id"
                    :movieTile="sortedItems[i]"
                    style="width: 500px;" class="mt-3"/>
        </div>
        <div class="my-2">
            <Paginator
                    :displayCount="5"
                    :pageCount="Math.ceil(items.length / pageSize)"
                    :currentPage="currentPage"
                    @onChange="onPageChange"
                    class="d-inline-block m-auto"/>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import MovieTile from '@/models/MovieTile';
import MovieTileView from '@/components/models/MovieTile.vue';
import Paginator from '@/components/Paginator.vue';
import multiSort from '@/utils/Sorting';

@Component({
    components: {
        MovieTileView,
        Paginator,
    },
})
export default class MovieTileList extends Vue {
    @Prop() private items!: MovieTile[];
    @Prop() private pageSize !: number;
    @Prop() private page!: number;
    private currentPage = this.page;
    private sortField = 'popularity';

    get sortedItems() {
        return multiSort(this.items, 'people.length:desc', 'movies.length:desc', `movie.${this.sortField}:desc`);
    }

    private onPageChange(page: number) {
        const container = this.$el.querySelector('.pagination-top');
        if (container) {
            container.scrollIntoView({block: 'nearest', behavior: 'instant'} as any);
        }
        this.currentPage = page;
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

<style scoped>
</style>
