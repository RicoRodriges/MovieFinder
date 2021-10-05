export type MovieId = number;

export default class MTMovie {
  constructor(
    public readonly id: MovieId,
    public readonly name: string,
    public readonly year: number | undefined,
    public readonly genre: string[],
  ) { }
}
