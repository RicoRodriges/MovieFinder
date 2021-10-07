import { tmdbApi } from '@/api/tmdb';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import Person from '@/models/Person';
import { zip } from '@/utils/collection';
import { batchAsyncGenerator } from '@/utils/request';
import { ProgressCallback } from './types';

export default class TMDBRecommendator {
  protected readonly api = tmdbApi;

  protected static readonly MAX_ACTIONS = 5;

  public async recommendMoviesByMovies(
    movies: Set<Movie>,
    lang: Language,
    progress: ProgressCallback,
  ): Promise<Array<[Movie[], Movie]>> {
    const recommend = (movie: Movie) => this.api.getRecommendations(movie.id, lang);
    const result = await this.recommend([...movies], recommend, (movie) => movie.id, progress);

    const movieIds = new Set([...movies].map((m) => m.id));
    return result.filter((r) => !movieIds.has(r[1].id)).map((r) => [r[0], r[1].toMovie()]);
  }

  public async recommendMoviesByActors(
    people: Set<Person>,
    lang: Language,
    progress: ProgressCallback,
  ): Promise<Array<[Person[], Movie]>> {
    const recommend = (actor: Person) => this.api.searchMoviesByPerson(actor.id, lang);
    const result = await this.recommend([...people], recommend, (movie) => movie.id, progress);

    return result.map((r) => [r[0], r[1].toMovie()]);
  }

  public async recommendActorsByMovies(
    movies: Set<Movie>,
    lang: Language,
    progress: ProgressCallback,
  ): Promise<Array<[Movie[], Person]>> {
    const recommend = (movie: Movie) => this.api.searchPersonsByMovie(movie.id, lang);
    const result = await this.recommend([...movies], recommend, (person) => person.id, progress);

    return result.map((r) => [r[0], r[1].toPerson()]);
  }

  public async recommendMoviesFromCollection(
    movies: Set<Movie>,
    lang: Language,
    progress: ProgressCallback,
  ): Promise<Array<[Movie[], Movie]>> {
    const recommend = (movie: Movie) => this.api.getCollectionByMovie(movie.id, lang)
      .then((collId) => {
        if (collId !== undefined) {
          return this.api.getCollectionMovies(collId, lang);
        }
        return [];
      });
    const result = await this.recommend([...movies], recommend, (movie) => movie.id, progress);

    const movieIds = new Set([...movies].map((m) => m.id));
    return result.filter((r) => !movieIds.has(r[1].id)).map((r) => [r[0], r[1].toMovie()]);
  }

  /**
   * @param inputs data to build recommendations
   * @param request request to build recommendations
   * @returns array [who produces recommendation, recommended item]
   */
  private async recommend<I, O, ID>(
    inputs: I[],
    request: (i: I) => Promise<O[]>,
    getID: (o: O) => ID,
    progress: ProgressCallback,
  ): Promise<Array<[I[], O]>> {
    const actions = inputs.map((i) => () => request(i));
    const total = actions.length;
    progress.update(0, total);

    const outputs: O[][] = [];
    for await (const chunk of batchAsyncGenerator(actions, TMDBRecommendator.MAX_ACTIONS)) {
      outputs.push(...chunk);
      progress.update(outputs.length, total);
    }

    const result = new Map<ID, [I[], O]>();
    for (const [os, i] of zip(outputs, inputs)) {
      for (const o of os) {
        const itemId = getID(o);
        const v = result.get(itemId);
        if (v) {
          v[0].push(i);
        } else {
          result.set(itemId, [[i], o]);
        }
      }
    }
    return [...result.values()];
  }
}

export const tmdbRecommendator = new TMDBRecommendator();
