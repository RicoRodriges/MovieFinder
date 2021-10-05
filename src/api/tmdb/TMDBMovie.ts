import Genre from '@/models/Genre';
import Movie from '@/models/Movie';
import TMDBGenre from './TMDBGenre';

export type MovieId = number;

export default class TMDBMovie {
  constructor(
        public readonly id: MovieId,
        public readonly title: string,
        public readonly originalTitle: string | undefined,
        public readonly overview: string,
        public readonly genres: TMDBGenre[],
        public readonly popularity: number,
        public readonly poster?: URL,
        public readonly voteCount?: number,
        public readonly voteAverage?: number,
        public readonly releaseDate?: Date,
  ) { }

  public toMovie(): Movie {
    return new Movie(this.id, this.title, this.overview,
      this.genres.map((g) => new Genre(g.id, g.name)), this.popularity, this.poster,
      this.voteCount, this.voteAverage, this.releaseDate);
  }
}
