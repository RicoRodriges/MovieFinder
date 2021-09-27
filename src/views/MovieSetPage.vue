<template>
    <div>
        <div class="alert alert-secondary my-3 mx-2" v-html="$t('message.cache_warning')"></div>
        <MovieSelector v-model="selectedMovies" :setActions="false"/>
        <div class="my-3 text-center">
            <button v-if="!inProgress"
              type="button" class="btn btn-success mt-3 mb-1 d-inline-block"
              @click="onImport">
                {{$t('set.import')}}
            </button>
            <br>
            <button v-if="!inProgress && selectedMovies.length > 0"
              type="button" class="btn btn-success mb-3 d-inline-block"
              @click="onExport">
                {{$t('set.export')}}
            </button>
        </div>
        <div v-if="inProgress">
            <CircleLoader/>
            {{$t('general.loading')}}
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CircleLoader from '@/components/CircleLoader.vue';
import MovieSelector from '@/components/selectors/MovieSelector.vue';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import { setService } from '@/services/SetService';
import { generalModule } from '@/store/general-module';
import { movieSetModule } from '@/store/movie-set-module';

@Component({
  components: {
    MovieSelector,
    CircleLoader,
  },
})
export default class MovieSetPage extends Vue {
    private readonly setService = setService;

    private inProgress = false;

    private get selectedMovies(): Movie[] {
      return movieSetModule.state.selectedMovies;
    }

    private set selectedMovies(v: Movie[]) {
      movieSetModule.mutations.setMovies(v);
    }

    private get lang(): Language {
      return generalModule.state.lang;
    }

    private async onImport() {
      try {
        this.inProgress = true;
        const movies = await this.setService.importMovieSetFromFile(this.lang);
        if (movies !== undefined) {
          this.selectedMovies = movies;
        }
      } finally {
        this.inProgress = false;
      }
    }

    private async onExport() {
      try {
        this.inProgress = true;
        if (this.selectedMovies.length > 0) {
          await this.setService.exportMovieSetToFile(this.selectedMovies, 'movies.csv');
        }
      } finally {
        this.inProgress = false;
      }
    }
}
</script>

<style scoped>
</style>
