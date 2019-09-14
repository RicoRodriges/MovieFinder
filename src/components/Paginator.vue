<template>
    <nav>
        <ul class="pagination">
            <li v-if="displayCount < pageCount" :class="'page-item ' + (currentPage === 1 ? 'disabled' : '')">
                <span v-if="currentPage === 1" class="page-link">{{$t('paginator.previous')}}</span>
                <a v-else class="page-link" href="#" @click.prevent="onPrev()">{{$t('paginator.previous')}}</a>
            </li>
            <li v-for="i in range(rangeStart, rangeEnd)" :class="'page-item ' + (i === currentPage ? 'active' : '')">
                <span v-if="currentPage === i" class="page-link">{{i}}</span>
                <a v-else class="page-link" href="#" @click.prevent="onChange(i)">{{i}}</a>
            </li>
            <li v-if="displayCount < pageCount" :class="'page-item ' + (currentPage === pageCount ? 'disabled' : '')">
                <span v-if="currentPage === pageCount" class="page-link">{{$t('paginator.next')}}</span>
                <a v-else class="page-link" href="#" @click.prevent="onNext()">{{$t('paginator.next')}}</a>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';

    @Component
    export default class Paginator extends Vue {
        @Prop() private displayCount!: number;
        @Prop() private pageCount!: number;
        @Prop() private currentPage!: number;

        private range(start: number, end: number) {
            const res = [];
            for (let i = start; i <= end; i++) {
                res.push(i);
            }
            return res;
        }

        private get rangeStart() {
            const center = this.displayCount / 2;
            const min = Math.trunc(center);
            // const max = Math.ceil(center);
            const minResult = Math.max(this.currentPage - min, 1);
            const maxResult = Math.max(this.pageCount - this.displayCount + 1, 1);
            return Math.min(minResult, maxResult);
        }

        private get rangeEnd() {
            return this.rangeStart + Math.min(this.displayCount, this.pageCount) - 1;
        }

        private onPrev() {
            if (this.currentPage > 1) {
                this.$emit('onChange', this.currentPage - 1);
            }
        }

        private onNext() {
            if (this.currentPage < this.pageCount) {
                this.$emit('onChange', this.currentPage + 1);
            }
        }

        private onChange(i: number) {
            if (this.currentPage !== i) {
                this.$emit('onChange', i);
            }
        }
    }
</script>

<style scoped>

</style>
