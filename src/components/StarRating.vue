<template>
    <div class="d-inline" :title="score">
    <span v-for="index in count">
        <img v-if="count/range*score >= index" src="@/assets/star-checked.svg" class="star">
        <img v-else src="@/assets/star.svg" class="star">
    </span>
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
    .star {
        width: 1rem;
    }
</style>
