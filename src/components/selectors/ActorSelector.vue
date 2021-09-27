<template>
    <div>
        {{$t('actor.actorName')}}:
        <ItemSelector :suggest="suggest"
                      :changeDebounceTime="500"
                      @onSelect="onSelect"
                      :placeholder="$t('actor.placeholder')"
                      :emptyPlaceholder="$t('actor.emptyPlaceholder')"
                      :notFoundPlaceholder="$t('actor.notFoundPlaceholder')"
                      class="d-inline-block"
                      style="max-width: 600px;">
            <template v-slot:default="val">
                <div class="d-inline-block align-middle mr-2">
                    <img v-if="val.item.poster" class="option__image" :src="val.item.poster"
                         :alt="val.item.name">
                    <img v-else class="option__image" src="@/assets/no-person.svg"
                         :alt="val.item.name">
                </div>
                <div class="option__desc d-inline-block align-middle">
                    <div class="option__title font-weight-bold h3">{{val.item.name}}</div>
                    <div class="option__small text-muted">{{$t('general.popularity')}}: {{val.item.popularity}}</div>
                </div>
            </template>
        </ItemSelector>
        <div class="my-1 text-center">
            <button v-if="value.length > 0" type="button" class="btn btn-danger d-inline-block mx-2" @click="onClear">
                {{$t('actor.clearList')}}
            </button>
            <button v-if="setActions && actorSet.length > 0" type="button" class="btn btn-success d-inline-block mx-2" @click="onAppendFromSet">
                {{$t('actor.appendToList')}}
            </button>
            <button v-if="setActions && value.length > 0" type="button" class="btn btn-success d-inline-block mx-2" @click="onAppendToSet">
                {{$t('actor.appendToSet')}}
            </button>
        </div>
        <div v-if="value.length > 0" class="my-3">
            <h5>{{$tc('actor.selectedNActors', value.length)}}:</h5>
            <div class="d-flex flex-row flex-wrap justify-content-around">
                <PersonView v-for="person in value" :key="person.id" :person="person" @onDelete="onDelete" style="width:200px;"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { tmdbApi } from '@/api/tmdb';
import PersonView from '@/components/models/Person.vue';
import { Language } from '@/models/Language';
import Person from '@/models/Person';
import { actorSetModule } from "@/store/actor-set-module";
import { generalModule } from '@/store/general-module';
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import ItemSelector from './ItemSelector.vue';

@Component({
    components: {
        ItemSelector,
        PersonView,
    },
})
export default class ActorSelector extends Vue {
    @Prop() private value !: Person[];
    @Prop() private setActions !: boolean;
    private readonly api = tmdbApi;

    private get lang(): Language {
        return generalModule.state.lang;
    }

    private get actorSet(): Person[] {
        return actorSetModule.state.selectedActors;
    }

    private async suggest(text: string): Promise<Person[]> {
        if (text.length === 0) {
            return [];
        } else {
            return (await this.api.searchPerson(text, this.lang))
                .sort((a, b) => b.popularity - a.popularity);
        }
    }

    @Emit('input')
    private input(actors: Person[]) {
        return;
    }

    private onSelect(person: Person) {
        const p = this.value.find(v => v.id === person.id);
        if (p === undefined) {
            this.input([...this.value, person]);
        }
    }

    private onDelete(person: Person) {
        const p = this.value.find(v => v.id === person.id);
        if (p !== undefined) {
            this.input(this.value.filter(v => v.id !== person.id));
        }
    }

    private onClear() {
        if (this.value.length > 0) {
            this.input([]);
        }
    }

    private onAppendFromSet() {
        const persons = [...this.value];
        for (const a of this.actorSet) {
            const p = persons.find(v => v.id === a.id);
            if (p === undefined) {
                persons.push(a);
            }
        }
        if (this.value.length !== persons.length) {
            this.input(persons);
        }
    }

    private onAppendToSet() {
        const persons = [...this.actorSet];
        for (const a of this.value) {
            const p = persons.find(v => v.id === a.id);
            if (p === undefined) {
                persons.push(a);
            }
        }
        if (this.actorSet.length !== persons.length) {
            actorSetModule.mutations.setActors(persons);
        }
    }
}
</script>

<style scoped>
    .option__image {
        height: 120px;
    }
</style>
