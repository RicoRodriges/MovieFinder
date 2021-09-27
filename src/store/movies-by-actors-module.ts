import { createModule } from 'vuexok';
import Movie from '@/models/Movie';
import Person from '@/models/Person';
import store from '.';

export const moviesByActorsModule = createModule('movies-by-actors', {
  namespaced: true,
  state: {
    selectedActors: [] as Person[],
    movies: [] as Array<[Person[], Movie]>,
  },
  mutations: {
    setActors(state, persons: Person[]) {
      state.selectedActors = persons;
    },
    recommend(state, movies: Array<[Person[], Movie]>) {
      state.movies = movies;
    },
  },
});

moviesByActorsModule.register(store);
