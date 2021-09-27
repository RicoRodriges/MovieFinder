import { GenreId } from "@/api/tmdb/TMDBGenre";

export default class Genre {
    constructor(
        public id: GenreId,
        public name: string,
    ) { }
}
