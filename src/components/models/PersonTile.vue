<template>
    <div class="card mx-2">
        <div>
            <a :href="getUrl(actor.id)" target="_blank">
                <img
                    v-if="actor.poster"
                    class="card-img-top m-auto d-inline-block w-auto"
                    :src="actor.poster"
                    :alt="actor.title"
                />
                <img
                    v-else
                    class="card-img-top m-auto d-inline-block w-auto"
                    src="@/assets/no-person.svg"
                    :alt="actor.title"
                />
            </a>
        </div>
        <div class="card-body">
            <h5 class="card-title">{{ actor.name }}</h5>
            <div>
                {{ $t("general.popularity") }}:
                <StarRating :count="10" :range="50" :score="actor.popularity" />
                ({{ actor.popularity }})
            </div>
            <slot></slot>
            <div class="my-2">
                <button
                    v-if="!isinActorSet"
                    @click="addToSet"
                    type="button"
                    class="btn btn-outline-primary my-1 mx-auto d-block"
                >
                    {{ $t("set.add") }}
                </button>
                <button
                    v-else
                    @click="removeFromSet"
                    type="button"
                    class="btn btn-outline-danger my-1 mx-auto d-block"
                >
                    {{ $t("set.remove") }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { tmdbApi } from '@/api/tmdb';
import { PersonId } from '@/api/tmdb/TMDBPerson';
import StarRating from '@/components/StarRating.vue';
import { Language } from '@/models/Language';
import Person from '@/models/Person';
import { actorSetModule } from '@/store/actor-set-module';
import { generalModule } from '@/store/general-module';

@Component({
  components: {
    StarRating,
  },
})
export default class PersonTileView extends Vue {
    private readonly api = tmdbApi;

    @Prop() private actor!: Person;

    private get lang(): Language {
      return generalModule.state.lang;
    }

    private get actorSet(): Person[] {
      return actorSetModule.state.selectedActors;
    }

    private get isinActorSet() {
      const m = this.actorSet.find((v) => v.id === this.actor.id);
      return m !== undefined;
    }

    private addToSet() {
      if (!this.isinActorSet) {
        actorSetModule.mutations.setActors([...this.actorSet, this.actor]);
      }
    }

    private removeFromSet() {
      if (this.isinActorSet) {
        actorSetModule.mutations.setActors(this.actorSet.filter((a) => a.id !== this.actor.id));
      }
    }

    private getUrl(id: PersonId): URL {
      return this.api.getPersonUrl(id, this.lang);
    }
}
</script>

<style scoped>
.card-img-top {
    max-height: 300px;
}
</style>
