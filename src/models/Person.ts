export default class Person {
    public id: number;
    public poster ?: string;
    public name: string;
    public popularity: number;

    constructor(id: number, name: string, popularity: number, poster?: string) {
        this.id = id;
        this.poster = poster;
        this.name = name;
        this.popularity = popularity;
    }
}
