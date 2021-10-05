/* eslint-disable no-continue */
import { mtApi } from '@/api/mt';
import MTMovie, { MovieId } from '@/api/mt/MTMovie';
import MTRating, { UserId } from '@/api/mt/MTRating';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import { zip } from '@/utils/collection';
import { batchAsyncGenerator } from '@/utils/request';
import { tmMovieMapper } from './MTMovieMapper';
import { ProgressCallback } from './types';

type Recommendator<O> = (
  ids: Array<[Movie, MovieId]>,
  ratingsByMovies: Map<MovieId, MTRating[]>,
  ratingsByUsers: Map<UserId, MTRating[]>,
  allMovies: Map<MovieId, MTMovie>,
  p: ProgressCallback,
) => Promise<O>;

export default class MTRecommendator {
  protected readonly api = mtApi;

  protected readonly mapper = tmMovieMapper;

  protected static readonly MAX_ACTIONS = 5;

  public async popular(
    movies: Movie[],
    lang: Language,
    limit: number,
    progress: ProgressCallback,
  ): Promise<Array<[number, Movie]>> {
    const recommendator: Recommendator<Array<[number, Movie]>> = async (
      ids,
      ratingsByMovies,
      ratingsByUsers,
      allMovies,
      p,
    ) => {
      const selectedMovieIds = new Set<MovieId>(ids.map((v) => v[1]));
      const counter = new Map<MovieId, number>();
      for (const userId of MTRecommendator.whoWatched(selectedMovieIds, ratingsByMovies)) {
        const ratings = ratingsByUsers.get(userId);
        if (ratings === undefined) continue;

        for (const r of MTRecommendator.normalizeUserRatings(ratings)) {
          if (!selectedMovieIds.has(r.movieId)) {
            const v = counter.get(r.movieId);
            counter.set(r.movieId, v ? (v + 1) : 1);
          }
        }
      }

      const result: Array<{ m: MTMovie, cnt: number }> = [];
      for (const [movieId, cnt] of counter) {
        result.push({ m: allMovies.get(movieId)!, cnt });
      }

      result.sort((a, b) => b.cnt - a.cnt);

      const mapperResult: Array<[number, Movie]> = [];
      const actions: Array<() => Promise<[number, Movie]>> = result
        .slice(0, limit)
        .map((v) => () => this.mapper.toTMDB(v.m, lang).then((r) => [v.cnt, r]));
      for await (const chunk of batchAsyncGenerator(actions, MTRecommendator.MAX_ACTIONS)) {
        mapperResult.push(...chunk);
        p.update(mapperResult.length, actions.length);
      }

      return mapperResult;
    };
    return this.recommend(movies, recommendator, progress);
  }

  public async watchTogether(
    movies: Movie[],
    lang: Language,
    limitPerMovie: number,
    progress: ProgressCallback,
  ): Promise<Array<[Movie[], Movie]>> {
    const recommendator: Recommendator<Array<[Movie[], Movie]>> = async (
      ids,
      ratingsByMovies,
      ratingsByUsers,
      allMovies,
      p,
    ) => {
      const result: Array<[Movie[], MTMovie]> = [];
      const selectedMovies = new Set<MovieId>(ids.map((v) => v[1]));

      let i = 0;
      for (const [srcMovie, srcMovieId] of ids) {
        const watchWithThis: Array<{ m: MTMovie, score: number }> = [];

        const usersWhoRatesThis = MTRecommendator.whoWatched([srcMovieId], ratingsByMovies);
        for (const m of allMovies.values()) {
          if (selectedMovies.has(m.id)) continue;

          const usersWhoRatesThat = MTRecommendator.whoWatched([m.id], ratingsByMovies);
          if (usersWhoRatesThat.size === 0) continue;

          const ratesBoth = MTRecommendator.intersection(usersWhoRatesThis, usersWhoRatesThat).size;
          if (ratesBoth === 0) continue;
          const ratesAtLeastOne = MTRecommendator.union(usersWhoRatesThis, usersWhoRatesThat).size;
          if (ratesAtLeastOne === 0) continue;

          watchWithThis.push({
            m,
            score: ratesBoth / ratesAtLeastOne,
          });
        }

        watchWithThis.sort((a, b) => b.score - a.score);
        for (const w of watchWithThis.slice(0, limitPerMovie)) {
          const movie = w.m;
          const existed = result.find((v) => v[1].id === movie.id);
          if (existed !== undefined) {
            existed[0].push(srcMovie);
          } else {
            result.push([[srcMovie], movie]);
          }
        }

        ++i;
        p.update(i, ids.length);
      }

      const mapperResult: Array<[Movie[], Movie]> = [];
      const actions: Array<() => Promise<[Movie[], Movie]>> = result
        .map((v) => () => this.mapper.toTMDB(v[1], lang).then((r) => [v[0], r]));
      for await (const chunk of batchAsyncGenerator(actions, MTRecommendator.MAX_ACTIONS)) {
        mapperResult.push(...chunk);
        p.update(mapperResult.length, result.length);
      }

      return mapperResult;
    };
    return this.recommend(movies, recommendator, progress);
  }

  public async similar(
    movies: Movie[],
    lang: Language,
    minMovieOverlap: number,
    minSimValue: number,
    minUsersOverlap: number,
    totalLimit: number,
    progress: ProgressCallback,
  ): Promise<Array<[number, Movie]>> {
    if (minSimValue <= 0 || minSimValue > 1) {
      console.warn(`Similarity ${minSimValue} must be in (0;1] range`);
      return [];
    }

    if (movies.length < minMovieOverlap) {
      console.warn(`You defined ${movies.length} movies, but min overlap is ${minMovieOverlap}`);
      return [];
    }

    const recommendator: Recommendator<Array<[number, Movie]>> = async (
      ids,
      ratingsByMovies,
      ratingsByUsers,
      allMovies,
      p,
    ) => {
      const selectedMovies = new Set<MovieId>(ids.map((v) => v[1]));
      const similarUsers = MTRecommendator.similarUsersWithNormalizedRatings(
        selectedMovies, minMovieOverlap, minSimValue, ratingsByUsers,
      );

      const counter = new Map<MovieId, number>();
      for (const v of similarUsers.values()) {
        for (const r of v.ratings) {
          if (selectedMovies.has(r.movieId)) continue;
          const c = counter.get(r.movieId);
          counter.set(r.movieId, c ? c + 1 : 1);
        }
      }

      const result: Array<{ m: MTMovie, score: number, cnt: number }> = [];
      for (const [movieId, cnt] of counter.entries()) {
        if (selectedMovies.has(movieId)) continue;

        const score = MTRecommendator.predictRating(movieId, similarUsers.values());
        if (score === undefined) continue;

        result.push({
          m: allMovies.get(movieId)!,
          score,
          cnt,
        });
      }

      result.sort((a, b) => b.score - a.score);

      const mapperResult: Array<[number, Movie]> = [];
      const actions: Array<() => Promise<[number, Movie]>> = result
        .filter((v) => v.cnt >= minUsersOverlap)
        .slice(0, totalLimit)
        .map((v) => () => this.mapper.toTMDB(v.m, lang).then((r) => [v.cnt, r]));
      for await (const chunk of batchAsyncGenerator(actions, MTRecommendator.MAX_ACTIONS)) {
        mapperResult.push(...chunk);
        p.update(mapperResult.length, actions.length);
      }

      return mapperResult;
    };
    return this.recommend(movies, recommendator, progress);
  }

  private async recommend<O>(
    inputs: Movie[],
    recommend: Recommendator<O>,
    progress: ProgressCallback,
  ): Promise<O> {
    const total = inputs.length * 2 + 3;
    let ready = 0;
    progress.update(ready, total);

    const ratingsByMovies = await this.api.getRatingsByMovies();
    progress.update(++ready, total);
    const ratingsByUsers = await this.api.getRatingsByUsers();
    progress.update(++ready, total);
    const allMovies = await this.api.getMovies();
    progress.update(++ready, total);

    const toMTActions = inputs.map((m) => () => this.mapper.toMT(m, allMovies.values()));
    const movieIDs: Array<MovieId | undefined> = [];
    for await (const chunk of batchAsyncGenerator(toMTActions, MTRecommendator.MAX_ACTIONS)) {
      movieIDs.push(...chunk);
      ready += chunk.length;
      progress.update(ready, total);
    }

    const selectedMovies = [...zip(inputs, movieIDs)]
      .filter((v) => v[1] !== undefined) as Array<[Movie, MovieId]>;
    const innerProgress: ProgressCallback = {
      update: (r, t) => progress.update(ready + r, inputs.length + 3 + t),
    };
    return recommend(selectedMovies, ratingsByMovies, ratingsByUsers, allMovies, innerProgress);
  }

  private static intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
    if (a.size > b.size) {
      const temp = a;
      a = b;
      b = temp;
    }
    return new Set([...a].filter((x) => b.has(x)));
  }

  private static union<T>(a: Set<T>, b: Iterable<T>): Set<T> {
    return new Set([...a, ...b]);
  }

  private static whoWatched(
    movies: Iterable<MovieId>,
    ratingsByMovies: Map<MovieId, MTRating[]>,
  ): Set<UserId> {
    let result = new Set<UserId>();
    for (const m of movies) {
      const ratings = ratingsByMovies.get(m);
      if (ratings && ratings.length > 0) {
        result = MTRecommendator.union(result, ratings.map((v) => v.userId));
      }
    }
    return result;
  }

  private static similarUsersWithNormalizedRatings(
    movieIds: Set<MovieId>,
    minMovieOverlap: number,
    minSimValue: number,
    ratingsByUsers: Map<UserId, MTRating[]>,
  ): Map<UserId, { sim: number, ratings: MTRating[] }> {
    const userRatings = [...movieIds].map((id) => new MTRating(id, 0, 0.4, new Date()));

    const result = new Map<UserId, { sim: number, ratings: MTRating[] }>();
    for (const [userId, ratings] of ratingsByUsers) {
      const overlap = ratings.reduce((sum, r) => (movieIds.has(r.movieId) ? sum + 1 : sum), 0);
      if (overlap < minMovieOverlap) continue;

      const normalizedRatings = MTRecommendator.normalizeUserRatings(ratings);
      const similarity = MTRecommendator.pearson(userRatings, normalizedRatings);
      if (similarity < minSimValue) continue;

      result.set(userId, { sim: similarity, ratings: normalizedRatings });
    }
    return result;
  }

  private static predictRating(
    m: MovieId,
    similar: Iterable<{ sim: number, ratings: MTRating[] }>,
  ): number | undefined {
    let up = 0;
    let down = 0;
    for (const v of similar) {
      if (v.sim <= 0) continue;
      const rating = v.ratings.find((r) => r.movieId === m)?.rating;
      if (rating === undefined) continue;

      up += v.sim * rating;
      down += v.sim;
    }
    return (down === 0) ? undefined : (up / down);
  }

  /**
   * Pearson function.
   * Measures how similar 2 users by their movie ratings.
   * @returns [-1; 1] range
   */
  private static pearson(user1: MTRating[], user2: MTRating[]): number {
    let sum = 0;
    let left = 0;
    let right = 0;
    for (const r1 of user1) {
      const r2 = user2.find((v) => v.movieId === r1.movieId);
      if (r2 === undefined) continue;

      sum += r1.rating * r2.rating;
      left += r1.rating * r1.rating;
      right += r2.rating * r2.rating;
    }
    return sum / Math.sqrt(left * right);
  }

  /**
   * Normalizes ratings.
   * @returns ratings in [-0.5; 0.5] range
   */
  private static normalizeUserRatings(ratings: MTRating[]): MTRating[] {
    let normalize = true;

    if (ratings.length <= 1) {
      normalize = false;
    } else {
      const anyR = ratings[0].rating;
      if (ratings.filter((v) => v.rating === anyR).length === ratings.length) normalize = false;
    }

    if (!normalize) {
      return ratings.map((r) => new MTRating(r.movieId, r.userId, 0, r.date));
    }

    let sum = 0;
    let min = 10000;
    let max = -10000;
    for (const r of ratings) {
      sum += r.rating;
      if (min > r.rating) min = r.rating;
      if (max < r.rating) max = r.rating;
    }
    const mean = sum / ratings.length;
    return ratings.map(
      (r) => new MTRating(r.movieId, r.userId, (r.rating - mean) / (max - min), r.date),
    );
  }
}

export const mtRecommendator = new MTRecommendator();
