import { createModule } from 'vuexok';
import Movie from '@/models/Movie';
import Person from '@/models/Person';
import store from '.';

export const actorsByMoviesModule = createModule('actors-by-movies', {
  namespaced: true,
  state: {
    selectedMovies: [] as Movie[],
    actors: [] as Array<[Movie[], Person]>,
  },
  mutations: {
    setMovies(state, movies: Movie[]) {
      state.selectedMovies = movies;
    },
    recommend(state, actors: Array<[Movie[], Person]>) {
      state.actors = actors;
    },
  },
});

actorsByMoviesModule.register(store);
