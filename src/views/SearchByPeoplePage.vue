<template>
    <div>
        <ActorSelector v-model="selectedActors" :setActions="true"/>
        <div v-if="!isSearching && selectedActors.length > 0">
            <div>
                <button type="button" class="btn btn-success m-3" @click="searchByActors">
                    {{$t('general.searchAsActors')}}
                </button>
                <button type="button" class="btn btn-success m-3" @click="searchByDirectors">
                    {{$t('general.searchAsDirectors')}}
                </button>
            </div>
            <MovieFilters v-if="allRecommendations.length > 0"
                          v-model="filter"
                          :genres="genres"
                          :yearRange="yearRange"
                          :sortOptions="sortOptions" />
            <PageableList v-if="recommendations.length > 0"
                          :items="sortedRecommendations"
                          :pageSize="pageSize"
                          :page="currentPage"
                          @onPageChange="onPageChange">
                <template slot-scope="props">
                    <MovieTileView :movie="props.item[1]" style="width: 500px;" class="mt-3">
                        <div>
                            {{$tc('actor.nActors', props.item[0].length)}}:
                            {{props.item[0].map((p) => p.name).slice(0, 4).join(', ')}}
                            <span v-if="props.item[0].length > 4">{{$t('general.andOthers')}}</span>
                        </div>
                    </MovieTileView>
                </template>
            </PageableList>
        </div>
        <ModalProgress v-if="isSearching" :ready="progress[0]" :total="progress[1]"/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { GenreId } from '@/api/tmdb/TMDBGenre';
import MovieFilters, { Filters } from '@/components/filters/MovieFilters.vue';
import ModalProgress from '@/components/ModalProgress.vue';
import MovieTileView from '@/components/models/MovieTile.vue';
import PageableList from '@/components/pageable/PageableList.vue';
import ActorSelector from '@/components/selectors/ActorSelector.vue';
import Genre from '@/models/Genre';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import Person from '@/models/Person';
import { tmdbRecommendator } from '@/services/TMDBRecommendator';
import { ProgressCallback } from '@/services/types';
import { generalModule } from '@/store/general-module';
import { movieSetModule } from '@/store/movie-set-module';
import { moviesByActorsModule } from '@/store/movies-by-actors-module';
import multiSort from '@/utils/sort';

@Component({
  components: {
    ActorSelector,
    MovieTileView,
    PageableList,
    MovieFilters,
    ModalProgress,
  },
})
export default class SearchByPeoplePage extends Vue {
    private readonly recommender = tmdbRecommendator;

    private progress: [number, number] | null = null;

    private pageSize = 9;

    private currentPage = 1;

    private readonly sortOptions = [
      { id: 'popularity', n: 'general.popularity' },
      { id: 'voteAverage', n: 'general.vote' },
    ];

    private filter: Filters = {
      excludeMoviesFromSet: false,
      includedGenres: [],
      excludedGenres: [],
      years: null,
      sort: this.sortOptions[0].id,
    };

    private get selectedActors(): Person[] {
      return moviesByActorsModule.state.selectedActors;
    }

    private set selectedActors(v: Person[]) {
      moviesByActorsModule.mutations.setActors(v);
    }

    private get allRecommendations(): Array<[Person[], Movie]> {
      return moviesByActorsModule.state.movies;
    }

    private set allRecommendations(v: Array<[Person[], Movie]>) {
      moviesByActorsModule.mutations.recommend(v);
      this.currentPage = 1;
      this.resetFilter();
    }

    private get recommendations(): Array<[Person[], Movie]> {
      let values = this.allRecommendations;
      if (values.length === 0) return values;

      if (this.filter.excludeMoviesFromSet && this.movieSet.length > 0) {
        const excludedIds = new Set(this.movieSet.map((m) => m.id));
        values = values.filter((m) => !excludedIds.has(m[1].id));
      }
      if (this.filter.includedGenres.length > 0) {
        const includedGenres = new Set(this.filter.includedGenres.map((g) => g.id));
        values = values.filter((m) => m[1].genres.some((g) => includedGenres.has(g.id)));
      }
      if (this.filter.excludedGenres.length > 0) {
        const excludedGenres = new Set(this.filter.excludedGenres.map((g) => g.id));
        values = values.filter((m) => m[1].genres.every((g) => !excludedGenres.has(g.id)));
      }
      if (this.filter.years !== null) {
        const [start, end] = this.filter.years;
        const dateFilter = (d: Date) => (start === null || d.getFullYear() >= start)
            && (end === null || d.getFullYear() <= end);
        values = values.filter((m) => !m[1].releaseDate || dateFilter(m[1].releaseDate));
      }

      return values;
    }

    private get sortedRecommendations(): Array<[Person[], Movie]> {
      return multiSort([...this.recommendations], '0.length:desc', `1.${this.filter.sort}:desc`);
    }

    private get genres(): Genre[] {
      const genres = new Map<GenreId, Genre>();
      for (const r of this.allRecommendations) {
        for (const genre of r[1].genres) {
          genres.set(genre.id, genre);
        }
      }
      return [...genres.values()].sort((a, b) => a.name.localeCompare(b.name));
    }

    private get yearRange(): [number, number] {
      let max = 1400;
      let min = 9000;
      for (const r of this.allRecommendations) {
        const year = r[1].releaseDate?.getFullYear();
        if (year !== undefined) {
          max = year > max ? year : max;
          min = year < min ? year : min;
        }
      }
      return [min, max];
    }

    private get lang(): Language {
      return generalModule.state.lang;
    }

    private get movieSet(): Movie[] {
      return movieSetModule.state.selectedMovies;
    }

    private get isSearching(): boolean {
      return this.progress !== null;
    }

    private onPageChange(page: number) {
      this.currentPage = page;
    }

    private async searchByActors() {
      this.searchMovies((p) => this.recommender.recommendMoviesByActors(
        new Set(this.selectedActors), this.lang, p,
      ));
    }

    private async searchByDirectors() {
      this.searchMovies((p) => this.recommender.recommendMoviesByDirectors(
        new Set(this.selectedActors), this.lang, p,
      ));
    }

    private async searchMovies(r: (p: ProgressCallback) => Promise<Array<[Person[], Movie]>>) {
      if (!this.isSearching) {
        try {
          this.progress = [0, 100];
          const progressCallback: ProgressCallback = {
            update: (ready, total) => { this.progress = [ready, total]; },
          };

          this.allRecommendations = await r(progressCallback);
        } finally {
          this.progress = null;
        }
      }
    }

    private resetFilter() {
      this.filter.excludeMoviesFromSet = false;
      this.filter.includedGenres = [];
      this.filter.excludedGenres = [];
      this.filter.years = null;
    }
}
</script>

<style scoped>
</style>
