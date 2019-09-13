import Movie from '@/models/Movie';
import Person from '@/models/Person';

export default class MovieTile {
    public movie: Movie;
    public people?: Person[];
    public movies?: Movie[];

    constructor(movie: Movie, people?: Person[], movies?: Movie[]) {
        this.movie = movie;
        this.people = people;
        this.movies = movies;
    }
}
