import TMDBApi from '@/services/TMDBApi';
import Person from '@/models/Person';
import Movie from '@/models/Movie';
import MovieTile from '@/models/MovieTile';

export default class SearchService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new SearchService();
        }
        return this.instance;
    }

    private static instance: SearchService;

    private readonly api = TMDBApi.getInstance();

    private constructor() {
    }

    public async searchMovies(people: Person[]) {
        const movies: Movie[] = [];
        const movieActors: { [k: number]: Person[] } = {};
        await Promise.all(people.map((p) => {
            return this.api.searchMoviesByPerson(p.id)
                .then((moviesByPerson) => {
                    moviesByPerson.forEach((movie) => {
                        this.addMovie(movies, movieActors, movie, p);
                    });
                });
        }));
        return movies.map((movie) => new MovieTile(movie, movieActors[movie.id]));
    }

    private addMovie(movies: Movie[], movieActors: { [movieId: number]: Person[] }, movie: Movie, person: Person) {
        const movieId = movie.id;
        if (movieId in movieActors) {
            movieActors[movieId].push(person);
        } else {
            movieActors[movieId] = [person];
        }
        if (!movies.some((f) => f.id === movie.id)) {
            movies.push(movie);
        }
    }
}
