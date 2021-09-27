import Person from '@/models/Person';
export type PersonId = number;

export default class TMDBPerson {
    constructor(
        public readonly id: PersonId,
        public readonly name: string,
        public readonly popularity: number,
        public readonly poster?: URL
    ) { }

    public toPerson(): Person {
        return new Person(this.id, this.name, this.popularity, this.poster);
    }
}