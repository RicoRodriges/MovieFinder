<template>
    <div>
        <MovieSelector v-model="selectedMovies" :setActions="true" />
        <div v-if="!isSearching && selectedMovies.length > 0">
            <div>
                <button type="button" class="btn btn-success m-3" @click="startSearch">
                    {{ $t("general.startSearch") }}
                </button>
            </div>
            <ActorFilters
                v-if="allRecommendations.length > 0"
                v-model="filter"
                :sortOptions="sortOptions"
            />
            <PageableList
                v-if="recommendations.length > 0"
                :items="sortedRecommendations"
                :pageSize="pageSize"
                :page="currentPage"
                @onPageChange="onPageChange"
            >
                <template slot-scope="props">
                    <PersonTileView :actor="props.item[1]" style="width: 500px;" class="mt-3">
                        <div>
                            {{ $t("general.recommended") }}
                            {{ $tc("general.nTimes", props.item[0].length) }}
                        </div>
                    </PersonTileView>
                </template>
            </PageableList>
        </div>
        <ModalProgress v-if="isSearching" :ready="progress[0]" :total="progress[1]" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ActorFilters, { Filters } from '@/components/filters/ActorFilters.vue';
import ModalProgress from '@/components/ModalProgress.vue';
import PersonTileView from '@/components/models/PersonTile.vue';
import PageableList from '@/components/pageable/PageableList.vue';
import MovieSelector from '@/components/selectors/MovieSelector.vue';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import Person from '@/models/Person';
import { tmdbRecommendator } from '@/services/TMDBRecommendator';
import { ProgressCallback } from '@/services/types';
import { actorSetModule } from '@/store/actor-set-module';
import { actorsByMoviesModule } from '@/store/actors-by-movies-module';
import { generalModule } from '@/store/general-module';
import multiSort from '@/utils/sort';

@Component({
  components: {
    MovieSelector,
    PersonTileView,
    PageableList,
    ActorFilters,
    ModalProgress,
  },
})
export default class SearchActorsByMovie extends Vue {
    private readonly recommender = tmdbRecommendator;

    private progress: [number, number] | null = null;

    private pageSize = 9;

    private currentPage = 1;

    private readonly sortOptions = [{ id: 'popularity', n: 'general.popularity' }];

    private filter: Filters = {
      excludeActorsFromSet: false,
      sort: this.sortOptions[0].id,
    };

    private get selectedMovies(): Movie[] {
      return actorsByMoviesModule.state.selectedMovies;
    }

    private set selectedMovies(v: Movie[]) {
      actorsByMoviesModule.mutations.setMovies(v);
    }

    private get allRecommendations(): Array<[Movie[], Person]> {
      return actorsByMoviesModule.state.actors;
    }

    private set allRecommendations(v: Array<[Movie[], Person]>) {
      actorsByMoviesModule.mutations.recommend(v);
      this.currentPage = 1;
      this.resetFilter();
    }

    private get recommendations(): Array<[Movie[], Person]> {
      let values = this.allRecommendations;
      if (values.length === 0) return values;

      if (this.filter.excludeActorsFromSet && this.actorSet.length > 0) {
        const excludedIds = new Set(this.actorSet.map((a) => a.id));
        values = values.filter((a) => !excludedIds.has(a[1].id));
      }

      return values;
    }

    private get sortedRecommendations(): Array<[Movie[], Person]> {
      return multiSort([...this.recommendations], '0.length:desc', `1.${this.filter.sort}:desc`);
    }

    private get lang(): Language {
      return generalModule.state.lang;
    }

    private get actorSet(): Person[] {
      return actorSetModule.state.selectedActors;
    }

    private get isSearching(): boolean {
      return this.progress !== null;
    }

    private onPageChange(page: number) {
      this.currentPage = page;
    }

    private async startSearch() {
      if (!this.isSearching) {
        try {
          this.progress = [0, 100];
          const progressCallback: ProgressCallback = {
            update: (ready, total) => {
              this.progress = [ready, total];
            },
          };

          this.allRecommendations = await this.recommender.recommendActorsByMovies(
            new Set(this.selectedMovies),
            this.lang,
            progressCallback,
          );
        } finally {
          this.progress = null;
        }
      }
    }

    private resetFilter() {
      this.filter.excludeActorsFromSet = false;
    }
}
</script>

<style scoped>
.option__image {
    height: 120px;
}
</style>
