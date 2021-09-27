import { PersonId } from "@/api/tmdb/TMDBPerson";

export default class Person {
    constructor(
        public readonly id: PersonId,
        public readonly name: string,
        public readonly popularity: number,
        public readonly poster?: URL
    ) { }
}
