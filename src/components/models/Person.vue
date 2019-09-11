<template>
    <div class="card m-2">
        <button type="button" class="close position-absolute p-2" style="top: 0; right: 0;" @click="onDelete(person)">
            <span>&times;</span>
        </button>
        <div>
            <a :href="`https://www.themoviedb.org/person/${person.id}?language=ru`" target="_blank">
                <img v-if="person.poster" class="card-img-top m-auto d-inline-block w-auto" :src="person.poster"
                     :alt="person.name">
                <img v-else class="card-img-top m-auto d-inline-block w-auto" src="@/assets/no-person.png"
                     :alt="person.name">
            </a>
        </div>
        <div class="card-body">
            <p class="card-text">{{person.name}}</p>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator';
import PersonModel from '@/models/Person';

@Component
export default class Person extends Vue {
    @Prop() private person!: PersonModel;

    @Emit('onDelete')
    private onDelete(item: PersonModel) {
        return;
    }
}
</script>

<style scoped>
    .card-img-top {
        max-height: 200px;
    }
</style>
