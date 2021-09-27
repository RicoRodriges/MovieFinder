<template>
    <div class="card m-2">
        <button
            type="button"
            class="close position-absolute p-2"
            style="top: 0; right: 0;"
            @click="onDelete(person)"
        >
            <span>&times;</span>
        </button>
        <div>
            <a :href="getUrl(person.id)" target="_blank">
                <img
                    v-if="person.poster"
                    class="card-img-top m-auto d-inline-block w-auto"
                    :src="person.poster"
                    :alt="person.name"
                />
                <img
                    v-else
                    class="card-img-top m-auto d-inline-block w-auto"
                    src="@/assets/no-person.svg"
                    :alt="person.name"
                />
            </a>
        </div>
        <div class="card-body">
            <p class="card-text">{{ person.name }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';
import { tmdbApi } from '@/api/tmdb';
import { PersonId } from '@/api/tmdb/TMDBPerson';
import { Language } from '@/models/Language';
import PersonModel from '@/models/Person';
import { generalModule } from '@/store/general-module';

@Component
export default class Person extends Vue {
    private readonly api = tmdbApi;

    @Prop() private person!: PersonModel;

    private get lang(): Language {
      return generalModule.state.lang;
    }

    private getUrl(id: PersonId): URL {
      return this.api.getPersonUrl(id, this.lang);
    }

    @Emit('onDelete')
    private onDelete(item: PersonModel) {}
}
</script>

<style scoped>
.card-img-top {
    max-height: 200px;
}
</style>
