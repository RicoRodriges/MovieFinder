<template>
    <div class="d-inline" :title="score">
        <span v-for="index in count" :key="index">
            <img v-if="index <= checkedStars" src="@/assets/star-checked.svg" class="star">
            <img v-else src="@/assets/star.svg" class="star">
        </span>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class StarRating extends Vue {
    @Prop() private count!: number;

    @Prop() private range!: number;

    @Prop() private score!: number;

    private get checkedStars(): number {
      return this.score / (this.range * this.count);
    }
}
</script>

<style scoped>
    .star {
        width: 1rem;
    }
</style>
