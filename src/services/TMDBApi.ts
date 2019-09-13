import Person from '@/models/Person';
import Movie from '@/models/Movie';
import Genre from '@/models/Genre';

export default class TMDBApi {

    public static getInstance() {
        if (!this.instance) {
            this.instance = new TMDBApi();
        }
        return this.instance;
    }

    protected static readonly apiKey = '3706398aaf547b46e616831a46402288';
    protected static readonly apiHost = 'https://api.themoviedb.org/3';
    protected static readonly posterPathRoot = 'https://image.tmdb.org/t/p/w500/';
    protected static readonly timeout = 3000;
    protected static readonly language = 'ru';
    private static instance: TMDBApi;

    protected genreList: Promise<Genre[]>;

    private constructor() {
        this.genreList = this.getGenreList();
    }

    public async searchPerson(query: string): Promise<Person[]> {
        const response = await this._getRequest(TMDBApi.apiHost + '/search/person', {
            api_key: TMDBApi.apiKey,
            language: TMDBApi.language,
            include_adult: 'true',
            query,
        });
        if (response.total_results > 0) {
            return response.results
                .map((r: any) => this.responseToPerson(r));
        }
        return [];
    }

    public async searchMovie(query: string): Promise<Movie[]> {
        const response = await this._getRequest(TMDBApi.apiHost + '/search/movie', {
            api_key: TMDBApi.apiKey,
            language: TMDBApi.language,
            include_adult: 'true',
            query,
        });
        if (response.total_results > 0) {
            return Promise.all(
                response.results
                    .map(async (r: any) => this.responseToMovie(r)),
            );
        }
        return [];
    }

    public async getPerson(personId: number) {
        const response = await this._getRequest(`${TMDBApi.apiHost}/person/${personId}`, {
            api_key: TMDBApi.apiKey,
            language: TMDBApi.language,
        });
        if (response.id !== undefined) {
            return this.responseToPerson(response);
        }
        return null;
    }

    public async getRecommendations(movieId: number, page = 1): Promise<Movie[]> {
        const response = await this._getRequest(`${TMDBApi.apiHost}/movie/${movieId}/recommendations`, {
            api_key: TMDBApi.apiKey,
            language: TMDBApi.language,
            page: page.toString(),
        });
        if (response.total_results > 0) {
            let nextPages: Promise<Movie[]>;
            if (response.total_pages > page) {
                nextPages = this.getRecommendations(movieId, page + 1);
            } else {
                nextPages = new Promise((a) => a([]));
            }
            const result = response.results
                .map(async (r: any) => this.responseToMovie(r));
            const moviesFromOtherPages = await nextPages;
            return Promise.all(result)
                .then((movies: any) => {
                    return movies.concat(moviesFromOtherPages);
                });
        }
        return [];
    }

    public async searchMoviesByPerson(personId: number): Promise<Movie[]> {
        const response = await this._getRequest(`${TMDBApi.apiHost}/person/${personId}/movie_credits`, {
            api_key: TMDBApi.apiKey,
            language: TMDBApi.language,
        });
        return Promise.all(
            response.cast
                .map(async (r: any) => this.responseToMovie(r)),
        );
    }

    private async getGenreList(): Promise<Genre[]> {
        const response = await this._getRequest(TMDBApi.apiHost + '/genre/movie/list', {
            api_key: TMDBApi.apiKey,
            language: TMDBApi.language,
        });
        return response.genres
            .map((r: any) => new Genre(r.id, r.name));
    }

    private async getGenres(ids: number[]): Promise<Genre[]> {
        if (ids && ids.length > 0) {
            return this.genreList.then((list) => {
                return ids.map((id) => list.filter((genre) => genre.id === id)[0])
                    .filter((g) => g !== undefined);
            });
        }
        return [];
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
                await new Promise((resolve) => setTimeout(resolve, TMDBApi.timeout));
            }
        }
    }

    private responseToPerson(r: any) {
        return new Person(r.id, r.name, r.popularity,
            r.profile_path ? (TMDBApi.posterPathRoot + r.profile_path) : undefined);
    }

    private async responseToMovie(r: any) {
        return new Movie(r.id, r.title, r.overview, await this.getGenres(r.genre_ids), r.popularity,
            r.poster_path ? (TMDBApi.posterPathRoot + r.poster_path) : undefined,
            r.vote_count, r.vote_average, new Date(r.release_date));
    }
}
