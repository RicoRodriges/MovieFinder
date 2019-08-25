<template>
    <div class="d-inline" :title="score">
    <span v-for="index in count"
          :class="{ fa: true, 'fa-star': true, 'fa-star-checked': count/range*score >= index }"></span>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class StarRating extends Vue {
    @Prop() private count!: number;
    @Prop() private range!: number;
    @Prop() private score!: number;
}
</script>

<style scoped>
    .fa-star-checked {
        color: orange;
    }
</style>
