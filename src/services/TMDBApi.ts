import Person from '@/models/Person';
import Film from '@/models/Film';

export default class TMDBApi {
    protected readonly apiKey = '3706398aaf547b46e616831a46402288';
    protected readonly apiHost = 'https://api.themoviedb.org/3';
    protected readonly timeout = 3000;
    protected readonly language = 'ru';

    public async findPeople(query: string): Promise<Person[]> {
        const response = await this._getRequest(this.apiHost + '/search/person', {
            api_key: this.apiKey,
            language: this.language,
            query,
        });
        if (response.total_results > 0) {
            return response.results
                .map((r) => new Person(r.id, r.name, r.popularity,
                    r.profile_path ? ('https://image.tmdb.org/t/p/w500/' + r.profile_path) : undefined))
                .sort((a: Person, b: Person) => b.popularity - a.popularity);
        }
        return [];
    }

    public async findFilmsByPerson(personId: number): Promise<Film[]> {
        const response = await this._getRequest(`${this.apiHost}/person/${personId}/movie_credits`, {
            api_key: this.apiKey,
            language: this.language,
        });
        return response.cast
            .map((r) => new Film(r.id, r.title, r.overview,
                r.poster_path ? ('https://image.tmdb.org/t/p/w500/' + r.poster_path) : undefined,
                r.popularity, r.vote_count, r.vote_average, new Date(r.release_date)));
    }

    private async _getRequest(url: string, params?: { [k: string]: string; }) {
        const requestParams = (params) ?
            '?' + Object.keys(params)
                .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
                .join('&')
            : '';
        while (true) {
            const response = await fetch(url + requestParams);
            if (response.status !== 429) {
                return await response.json();
            } else {
                await new Promise((resolve) => setTimeout(resolve, this.timeout));
            }
        }
    }
}
