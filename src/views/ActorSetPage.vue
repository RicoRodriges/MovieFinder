<template>
    <div>
        <div class="alert alert-secondary my-3 mx-2" v-html="$t('message.cache_warning')"></div>
        <ActorSelector v-model="selectedActors" :setActions="false"/>
        <div class="my-3 text-center">
            <button v-if="!inProgress"
              type="button" class="btn btn-success mt-3 mb-1 d-inline-block"
              @click="onImport">
                {{$t('set.import')}}
            </button>
            <br>
            <button v-if="!inProgress && selectedActors.length > 0"
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
import ActorSelector from '@/components/selectors/ActorSelector.vue';
import { Language } from '@/models/Language';
import Person from '@/models/Person';
import { setService } from '@/services/SetService';
import { ProgressCallback } from '@/services/types';
import { actorSetModule } from '@/store/actor-set-module';
import { generalModule } from '@/store/general-module';

@Component({
  components: {
    ActorSelector,
    ModalProgress,
  },
})
export default class ActorSetPage extends Vue {
    private readonly setService = setService;

    private progress: [number, number] | null = null;

    private get selectedActors(): Person[] {
      return actorSetModule.state.selectedActors;
    }

    private set selectedActors(v: Person[]) {
      actorSetModule.mutations.setActors(v);
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

        const persons = await this.setService.importPersonSetFromFile(this.lang, progressCallback);
        if (persons !== undefined) {
          this.selectedActors = persons;
        }
      } finally {
        this.progress = null;
      }
    }

    private async onExport() {
      if (this.selectedActors.length > 0) {
        this.setService.exportPersonSetToFile(this.selectedActors, 'actors.csv');
      }
    }
}
</script>

<style scoped>
</style>
