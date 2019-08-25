import Film from '@/models/Film';
import Person from '@/models/Person';

export default class FilmTile {
    public film: Film;
    public people: Person[];

    constructor(film: Film, people: Person[]) {
        this.film = film;
        this.people = people;
    }
}
