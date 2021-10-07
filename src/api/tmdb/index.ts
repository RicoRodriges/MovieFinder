import { Language } from '@/models/Language';
import { get, sleep } from '@/utils/request';
import TMDBGenre, { GenreId } from './TMDBGenre';
import TMDBMovie, { MovieId } from './TMDBMovie';
import TMDBPerson, { PersonId } from './TMDBPerson';

export default class TMDBApi {
    protected static readonly apiKey = '3706398aaf547b46e616831a46402288';

    protected static readonly apiHost = 'https://api.themoviedb.org/3';

    protected static readonly posterPathRoot = 'https://image.tmdb.org/t/p/w500/';

    protected static readonly timeout = 3000;

    protected static readonly host = 'https://www.themoviedb.org';

    private genres = new Map<Language, Promise<Map<GenreId, TMDBGenre>>>();

    public getMovieUrl(id: MovieId, lang: Language): URL {
      return new URL(`${TMDBApi.host}/movie/${id}?language=${lang}`);
    }

    public getPersonUrl(id: PersonId, lang: Language): URL {
      return new URL(`${TMDBApi.host}/person/${id}?language=${lang}`);
    }

    public async searchPerson(query: string, language: Language): Promise<TMDBPerson[]> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/search/person`, {
        api_key: TMDBApi.apiKey,
        language,
        include_adult: 'true',
        query,
      });
      if (response.total_results > 0) {
        return response.results.map((r: any) => this.responseToPerson(r));
      }
      return [];
    }

    public async searchMovie(query: string, language: Language): Promise<TMDBMovie[]> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/search/movie`, {
        api_key: TMDBApi.apiKey,
        language,
        include_adult: 'true',
        query,
      });
      if (response.total_results > 0) {
        return Promise.all(
          response.results.map(async (r: any) => this.responseToMovie(r, language)),
        );
      }
      return [];
    }

    public async getPerson(
      personId: PersonId,
      language: Language,
    ): Promise<TMDBPerson | undefined> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/person/${personId}`, {
        api_key: TMDBApi.apiKey,
        language,
      });
      if (response.id !== undefined) {
        return this.responseToPerson(response);
      }
      return undefined;
    }

    public async getMovie(movieId: MovieId, language: Language): Promise<TMDBMovie | undefined> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/movie/${movieId}`, {
        api_key: TMDBApi.apiKey,
        language,
      });
      if (response.id !== undefined) {
        return this.responseToMovie(response, language);
      }
      return undefined;
    }

    public async getRecommendations(movieId: MovieId, language: Language): Promise<TMDBMovie[]> {
      const request = (page: number) => this.getRequest(`${TMDBApi.apiHost}/movie/${movieId}/recommendations`, {
        api_key: TMDBApi.apiKey,
        language,
        page: page.toString(),
      });
      const totalPages = (r: any) => r.total_pages;
      const map = (r: any) => r.results.map(async (v: any) => this.responseToMovie(v, language));
      return this.fetchAllPages(request, totalPages, map);
    }

    public async searchPersonsByMovie(
      movieId: MovieId,
      language: Language,
    ): Promise<TMDBPerson[]> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/movie/${movieId}/credits`, {
        api_key: TMDBApi.apiKey,
        language,
      });
      return response.cast
        .filter((r: any) => r.known_for_department === 'Acting')
        .sort((r1: any, r2: any) => r1.order - r2.order)
        .map((r: any) => this.responseToPerson(r));
    }

    public async searchMoviesByPerson(
      personId: PersonId,
      language: Language,
    ): Promise<TMDBMovie[]> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/person/${personId}/movie_credits`, {
        api_key: TMDBApi.apiKey,
        language,
      });
      return Promise.all(
        response.cast.map(async (r: any) => this.responseToMovie(r, language)),
      );
    }

    public async getCollectionByMovie(
      movieId: MovieId,
      language: Language,
    ): Promise<number | undefined> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/movie/${movieId}`, {
        api_key: TMDBApi.apiKey,
        language,
      });
      return response.belongs_to_collection?.id;
    }

    public async getCollectionMovies(collId: number, language: Language): Promise<TMDBMovie[]> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/collection/${collId}`, {
        api_key: TMDBApi.apiKey,
        language,
      });
      return Promise.all(
        response.parts.map(async (r: any) => this.responseToMovie(r, language)),
      );
    }

    public async getGenres(language: Language): Promise<Map<GenreId, TMDBGenre>> {
      let r = this.genres.get(language);
      if (!r) {
        r = this.requestGenres(language);
        this.genres.set(language, r);
      }
      return r;
    }

    private async requestGenres(language: Language): Promise<Map<GenreId, TMDBGenre>> {
      const response = await this.getRequest(`${TMDBApi.apiHost}/genre/movie/list`, {
        api_key: TMDBApi.apiKey,
        language,
      });

      const map = new Map<GenreId, TMDBGenre>();
      for (const r of response.genres) {
        map.set(r.id, new TMDBGenre(r.id, r.name));
      }
      return map;
    }

    /* eslint-disable no-await-in-loop */
    private async getRequest(url: string, params?: { [k: string]: string; }) {
      while (true) {
        const response = await get(url, params);
        if (response.status !== 429) {
          return response.json();
        }
        await sleep(TMDBApi.timeout);
      }
    }
    /* eslint-enable no-await-in-loop */

    private responseToPerson(r: any) {
      return new TMDBPerson(r.id, r.name, r.popularity,
        r.profile_path ? new URL(`${TMDBApi.posterPathRoot}/${r.profile_path}`) : undefined);
    }

    private async responseToMovie(r: any, lang: Language) {
      const genres = await this.getGenres(lang);
      let movieGenres: TMDBGenre[];
      if (r.genres !== undefined) {
        movieGenres = r.genres.map((v: any) => genres.get(v.id));
      } else {
        movieGenres = r.genre_ids.map((v: number) => genres.get(v));
      }
      return new TMDBMovie(r.id, r.title, r.original_title, r.overview, movieGenres, r.popularity,
        r.poster_path ? new URL(`${TMDBApi.posterPathRoot}/${r.poster_path}`) : undefined,
        r.vote_count, r.vote_average, new Date(r.release_date));
    }

    private async fetchAllPages<R, T>(
      request: (page: number) => R,
      totalPages: (r: R) => number,
      getItems: (r: R) => Array<Promise<T>>,
      pageLimit: number | undefined = undefined,
      page = 1,
    ): Promise<T[]> {
      const response = await request(page);

      let nextPages: Promise<T[]>;
      if (totalPages(response) > page && (pageLimit === undefined || pageLimit >= page)) {
        nextPages = this.fetchAllPages(request, totalPages, getItems, pageLimit, page + 1);
      } else {
        nextPages = new Promise((resolve) => resolve([]));
      }
      const items: T[] = await Promise.all(getItems(response));
      return items.concat(await nextPages);
    }
}

export const tmdbApi = new TMDBApi();
