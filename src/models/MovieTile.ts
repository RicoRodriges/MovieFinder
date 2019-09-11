import Movie from '@/models/Movie';
import Person from '@/models/Person';

export default class MovieTile {
    public movie: Movie;
    public people: Person[];

    constructor(movie: Movie, people: Person[]) {
        this.movie = movie;
        this.people = people;
    }
}
