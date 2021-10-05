import { MovieId } from './MTMovie';

export type UserId = number;

export default class MTRating {
  constructor(
    public readonly movieId: MovieId,
    public readonly userId: UserId,
    public readonly rating: number,
    public readonly date: Date,
  ) { }
}
