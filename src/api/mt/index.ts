import MTMovie, { MovieId } from './MTMovie';
import MTRating, { UserId } from './MTRating';

export default class MovieTweetingsApi {
  protected static readonly apiHost = 'https://raw.githubusercontent.com/sidooms/MovieTweetings/master/latest';

  private ratings: Promise<MTRating[]> | null = null;

  private movies: Promise<Map<MovieId, MTMovie>> | null = null;

  public async getRatings(): Promise<MTRating[]> {
    if (this.ratings === null) {
      this.ratings = this.requestRatings();
    }
    return this.ratings;
  }

  public async getRatingsByMovies(): Promise<Map<MovieId, MTRating[]>> {
    const ratingsByMovies = new Map<MovieId, MTRating[]>();
    for (const r of (await this.getRatings())) {
      MovieTweetingsApi.merge(ratingsByMovies, r.movieId, r);
    }
    return ratingsByMovies;
  }

  public async getRatingsByUsers(): Promise<Map<UserId, MTRating[]>> {
    const ratingsByUsers = new Map<UserId, MTRating[]>();
    for (const r of (await this.getRatings())) {
      MovieTweetingsApi.merge(ratingsByUsers, r.userId, r);
    }
    return ratingsByUsers;
  }

  public async getMovies(): Promise<Map<MovieId, MTMovie>> {
    if (this.movies === null) {
      this.movies = this.requestMovies();
    }
    return this.movies;
  }

  private async requestRatings(): Promise<MTRating[]> {
    const ratings: MTRating[] = [];
    const r = await fetch(`${MovieTweetingsApi.apiHost}/ratings.dat`);
    const d = await r.text();
    for (const l of d.split('\n')) {
      const data = l.split('::');
      if (data.length === 4) {
        const userId = parseInt(data[0], 10);
        const movieId = parseInt(data[1], 10);
        const rating = parseInt(data[2], 10);
        const date = new Date(parseInt(data[3], 10) * 1000);
        ratings.push(new MTRating(movieId, userId, rating, date));
      }
    }
    return ratings;
  }

  private async requestMovies(): Promise<Map<MovieId, MTMovie>> {
    const movies = new Map<MovieId, MTMovie>();
    const r = await fetch(`${MovieTweetingsApi.apiHost}/movies.dat`);
    const d = await r.text();
    for (const l of d.split('\n')) {
      const data = l.split('::');
      if (data.length === 3) {
        const id = parseInt(data[0], 10);
        const name = data[1].substr(0, data[1].length - 7)
          .replaceAll('&amp;', '&')
          .replaceAll('&x27;', '\'')
          .replaceAll('&quot;', '"');
        const year = parseInt(data[1].substr(data[1].length - 5, 4), 10);
        const genre = data[2].length === 0 ? [] : data[2].split('|');
        movies.set(id, new MTMovie(id, name, year, genre));
      }
    }
    return movies;
  }

  private static async cached<T>(cache: Promise<T> | null, action: () => Promise<T>): Promise<T> {
    if (cache) return cache;
    return action();
  }

  private static merge<K, V>(m: Map<K, V[]>, k: K, v: V) {
    const array = m.get(k);
    if (!array) {
      m.set(k, [v]);
      return;
    }
    array.push(v);
  }
}

export const mtApi = new MovieTweetingsApi();
