export default class Film {
    public id: number;
    public title: string;
    public poster ?: string;
    public popularity?: number;
    public voteCount?: number;
    public voteAverage?: number;
    public overview: string;
    public releaseDate?: Date;

    constructor(id: number, title: string, overview: string,
                poster?: string, popularity?: number, voteCount?: number, voteAverage?: number, releaseDate?: Date) {
        this.id = id;
        this.title = title;
        this.poster = poster;
        this.popularity = popularity;
        this.voteCount = voteCount;
        this.voteAverage = voteAverage;
        this.overview = overview;
        this.releaseDate = releaseDate;
    }
}
