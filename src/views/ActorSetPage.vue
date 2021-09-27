<template>
    <div>
        <div class="alert alert-secondary my-3 mx-2" v-html="$t('message.cache_warning')"></div>
        <ActorSelector v-model="selectedActors" :setActions="false"/>
        <div class="my-3 text-center">
            <button v-if="!inProgress" type="button" class="btn btn-success mt-3 mb-1 d-inline-block" @click="onImport">
                {{$t('set.import')}}
            </button>
            <br>
            <button v-if="!inProgress && selectedActors.length > 0" type="button" class="btn btn-success mb-3 d-inline-block" @click="onExport">
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
import CircleLoader from '@/components/CircleLoader.vue';
import ActorSelector from '@/components/selectors/ActorSelector.vue';
import { Language } from '@/models/Language';
import Person from '@/models/Person';
import { setService } from '@/services/SetService';
import { actorSetModule } from '@/store/actor-set-module';
import { generalModule } from '@/store/general-module';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
        ActorSelector,
        CircleLoader,
    },
})
export default class ActorSetPage extends Vue {
    private readonly setService = setService;
    private inProgress = false;

    private get selectedActors(): Person[] {
        return actorSetModule.state.selectedActors;
    }

    private set selectedActors(v: Person[]) {
        actorSetModule.mutations.setActors(v);
    }

    private get lang(): Language {
        return generalModule.state.lang;
    }

    private async onImport() {
        try {
            this.inProgress = true;
            const persons = await this.setService.importPersonSetFromFile(this.lang);
            if (persons !== undefined) {
                this.selectedActors = persons;
            }
        } finally {
            this.inProgress = false;
        }
    }

    private async onExport() {
        try {
            this.inProgress = true;
            if (this.selectedActors.length > 0) {
                await this.setService.exportPersonSetToFile(this.selectedActors, 'actors.csv');
            }
        } finally {
            this.inProgress = false;
        }
    }
}
</script>

<style scoped>
</style>
