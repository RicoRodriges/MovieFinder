import Movie from '@/models/Movie';
import { createModule } from "vuexok";
import store from ".";

export const movieSetModule = createModule("movie-set", {
    namespaced: true,
    state: {
        selectedMovies: [] as Movie[],
    },
    mutations: {
        setMovies(state, movies: Movie[]) {
            state.selectedMovies = movies;
        }
    }
});

movieSetModule.register(store);