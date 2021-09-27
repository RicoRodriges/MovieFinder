import { MovieId } from "@/api/tmdb/TMDBMovie";
import Genre from "./Genre";

export default class Movie {
    constructor(
        public readonly id: MovieId,
        public readonly title: string,
        public readonly overview: string,
        public readonly genres: Genre[],
        public readonly popularity: number,
        public readonly poster?: URL,
        public readonly voteCount?: number,
        public readonly voteAverage?: number,
        public readonly releaseDate?: Date,
    ) { }
}
