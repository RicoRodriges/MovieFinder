import Movie from '@/models/Movie';
import { createModule } from "vuexok";
import store from ".";

export const moviesByMoviesModule = createModule("movies-by-movies", {
    namespaced: true,
    state: {
        selectedMovies: [] as Movie[],
        movies: [] as Array<[Movie[], Movie]>,
    },
    mutations: {
        setMovies(state, movies: Movie[]) {
            state.selectedMovies = movies;
        },
        recommend(state, movies: Array<[Movie[], Movie]>) {
            state.movies = movies;
        }
    }
});

moviesByMoviesModule.register(store);