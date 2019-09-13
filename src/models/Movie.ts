import Genre from '@/models/Genre';

export default class Movie {
    public id: number;
    public title: string;
    public poster ?: string;
    public popularity: number;
    public voteCount?: number;
    public voteAverage?: number;
    public overview: string;
    public releaseDate?: Date;
    public genres: Genre[];

    constructor(id: number, title: string, overview: string, genres: Genre[],
                popularity: number, poster?: string, voteCount?: number, voteAverage?: number, releaseDate?: Date) {
        this.id = id;
        this.title = title;
        this.poster = poster;
        this.genres = genres;
        this.popularity = popularity;
        this.voteCount = voteCount;
        this.voteAverage = voteAverage;
        this.overview = overview;
        this.releaseDate = releaseDate;
    }
}
