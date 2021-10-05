import MTMovie, { MovieId as MTMovieId } from '@/api/mt/MTMovie';
import { tmdbApi } from '@/api/tmdb';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';

export default class MTMovieMapper {
  protected api = tmdbApi;

  protected movies = new Map<Language, Map<MTMovieId, Movie>>();

  protected mtMovies = new Map<number, MTMovieId | null>();

  public async toTMDB(mtMovie: MTMovie, lang: Language): Promise<Movie> {
    if (this.movies.get(lang) === undefined) this.movies.set(lang, new Map());

    const cachedMovie = this.movies.get(lang)?.get(mtMovie.id);
    if (cachedMovie !== undefined) {
      return cachedMovie;
    }

    const cachedMovieId = [...this.movies.values()]
      .map((v) => v.get(mtMovie.id))
      .find((v) => v !== undefined)?.id;
    if (cachedMovieId !== undefined) {
      const v = await tmdbApi.getMovie(cachedMovieId, lang);
      if (v === undefined) throw new Error(`Movie ${cachedMovieId} does not exist in TMDB database!`);
      return this.cacheAndReturn(mtMovie, lang, v.toMovie());
    }

    let candidates = await this.api.searchMovie(mtMovie.name, lang);
    if (candidates.length > 1 && mtMovie.year) {
      candidates = candidates.filter(
        (m) => m.releaseDate && m.releaseDate.getFullYear() === mtMovie.year,
      );
    }
    if (candidates.length > 1) {
      candidates = candidates.filter(
        (m) => m.originalTitle?.toUpperCase() === mtMovie.name.toUpperCase(),
      );
    }
    if (candidates.length === 1) {
      return this.cacheAndReturn(mtMovie, lang, candidates[0].toMovie());
    }

    console.warn(`${candidates.length} movies were found by ${mtMovie.name} query in TMDB`);
    return this.cacheAndReturn(mtMovie, lang, MTMovieMapper.toMovie(mtMovie));
  }

  public async toMT(
    movie: Movie,
    allMovies: Iterable<MTMovie>,
  ): Promise<MTMovieId | undefined> {
    const cachedId = this.mtMovies.get(movie.id);
    if (cachedId !== undefined) {
      return cachedId || undefined;
    }

    const titleToSearch = (await this.api.getMovie(movie.id, Language.EN))!.title.toUpperCase();

    let result: MTMovieId | undefined;
    for (const m of allMovies) {
      if (titleToSearch === m.name.toUpperCase()) {
        if (m.year !== undefined && movie.releaseDate !== undefined
           && m.year === movie.releaseDate.getFullYear()) {
          this.mtMovies.set(movie.id, m.id);
          return m.id;
        }
        result = m.id;
      }
    }

    if (result !== undefined) {
      console.warn(`"${movie.title}" movie has bad date in TMDB or MT`);
      this.mtMovies.set(movie.id, result);
      return result;
    }

    console.warn(`"${movie.title}"/"${titleToSearch}" was not found in MT collection`);
    return undefined;
  }

  private cacheAndReturn(mtMovie: MTMovie, lang: Language, result: Movie) {
    let map = this.movies.get(lang);
    if (map === undefined) {
      map = new Map();
      this.movies.set(lang, map);
    }
    map.set(mtMovie.id, result);
    return result;
  }

  private static toMovie(m: MTMovie): Movie {
    if (m.year !== undefined) {
      return new Movie(m.id, m.name, '', [], 0, undefined, undefined, undefined, new Date(m.year, 1, 2));
    }
    return new Movie(m.id, m.name, '', [], 0);
  }
}

export const tmMovieMapper = new MTMovieMapper();
