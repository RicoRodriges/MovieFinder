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
        <ModalProgress v-if="inProgress" :ready="progress[0]" :total="progress[1]"/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ModalProgress from '@/components/ModalProgress.vue';
import MovieSelector from '@/components/selectors/MovieSelector.vue';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import { setService } from '@/services/SetService';
import { ProgressCallback } from '@/services/types';
import { generalModule } from '@/store/general-module';
import { movieSetModule } from '@/store/movie-set-module';

@Component({
  components: {
    MovieSelector,
    ModalProgress,
  },
})
export default class MovieSetPage extends Vue {
    private readonly setService = setService;

    private progress: [number, number] | null = null;

    private get selectedMovies(): Movie[] {
      return movieSetModule.state.selectedMovies;
    }

    private set selectedMovies(v: Movie[]) {
      movieSetModule.mutations.setMovies(v);
    }

    private get lang(): Language {
      return generalModule.state.lang;
    }

    private get inProgress(): boolean {
      return this.progress !== null;
    }

    private async onImport() {
      try {
        this.progress = [0, 100];
        const progressCallback: ProgressCallback = {
          update: (ready, total) => { this.progress = [ready, total]; },
        };

        const movies = await this.setService.importMovieSetFromFile(this.lang, progressCallback);
        if (movies !== undefined) {
          this.selectedMovies = movies;
        }
      } finally {
        this.progress = null;
      }
    }

    private async onExport() {
      if (this.selectedMovies.length > 0) {
        this.setService.exportMovieSetToFile(this.selectedMovies, 'movies.csv');
      }
    }
}
</script>

<style scoped>
</style>
