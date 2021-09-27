<template>
    <div v-if="items.length > 0">
        <div class="my-2">
            <Paginator :displayCount="5"
                       :pageCount="Math.ceil(items.length / pageSize)"
                       :currentPage="page"
                       @onChange="onPageChange"
                       class="d-inline-block m-auto"/>
        </div>
        <div class="d-flex flex-row flex-wrap justify-content-around">
            <slot v-for="i in range(rangeStart, rangeEnd)" :item="items[i]" style="width: 500px;" class="mt-3"></slot>
        </div>
        <div class="my-2">
            <Paginator
                    :displayCount="5"
                    :pageCount="Math.ceil(items.length / pageSize)"
                    :currentPage="page"
                    @onChange="onPageChange"
                    class="d-inline-block m-auto"/>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import Paginator from './Paginator.vue';

@Component({
    components: {
        Paginator,
    },
})
export default class PageableList<T> extends Vue {
    @Prop() private items!: T[];
    @Prop() private pageSize!: number;
    @Prop() private page!: number;

    @Emit('onPageChange')
    private onPageChange(page: number) {
        return;
    }

    private get rangeStart(): number {
        return this.pageSize * (this.page - 1);
    }

    private get rangeEnd(): number {
        return Math.min(this.items.length, (this.pageSize * this.page)) - 1;
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
