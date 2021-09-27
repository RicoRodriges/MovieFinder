export type GenreId = number;

export default class TMDBGenre {
  constructor(
        public readonly id: GenreId,
        public readonly name: string,
  ) { }
}
