import TMDBApi from '@/services/TMDBApi';
import Person from '@/models/Person';
import Film from '@/models/Film';
import FilmTile from '@/models/FilmTile';

export default class SearchService {
    private readonly api = new TMDBApi();

    public async searchFilms(people: Person[]) {
        const films: Film[] = [];
        const filmActors: { [k: number]: Person[] } = {};
        let personIndex = 0;
        await Promise.all(people.map((p) => this.api.findFilmsByPerson(p.id)))
            .then((vals) => {
                vals.forEach((actorFilms) => {
                    actorFilms.forEach((film) => {
                        this.addFilm(films, filmActors, film, people[personIndex]);
                    });
                    ++personIndex;
                });
            });
        return films.map((f) => new FilmTile(f, filmActors[f.id]))
            .sort((a, b) => b.people.length - a.people.length);
    }

    private addFilm(films: Film[], filmActors: { [k: number]: Person[] }, film: Film, person: Person) {
        const filmId = film.id;
        if (filmId in filmActors) {
            filmActors[filmId].push(person);
        } else {
            filmActors[filmId] = [person];
        }
        if (!films.some((f) => f.id === film.id)) {
            films.push(film);
        }
    }
}
