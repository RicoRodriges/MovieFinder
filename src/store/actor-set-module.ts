import { createModule } from 'vuexok';
import Person from '@/models/Person';
import store from '.';

export const actorSetModule = createModule('actor-set', {
  namespaced: true,
  state: {
    selectedActors: [] as Person[],
  },
  mutations: {
    setActors(state, actors: Person[]) {
      state.selectedActors = actors;
    },
  },
});

actorSetModule.register(store);
