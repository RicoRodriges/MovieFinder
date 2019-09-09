import TMDBApi from '@/services/TMDBApi';
import Person from '@/models/Person';
import Film from '@/models/Film';

describe('TMDBApi service', () => {
    it('findPeople test', async () => {
        let actualUrl: any;
        window.fetch = (url) => {
            actualUrl = url;
            // @ts-ignore
            return new Promise((s) => s({
                status: 200,
                json: () => new Promise((s2) => s2({
                    total_results: 1,
                    results: [{
                        id: 1,
                        name: 'name',
                        popularity: 20,
                        profile_path: '1.jpg',
                    }],
                })),
            }));
        };

        const service = new TMDBApi();
        const actual = await service.findPeople('person name');

        expect(actualUrl).toContain('https://api.themoviedb.org/3/search/person?');
        expect(actualUrl).toContain('query=person%20name');
        expect(actual.length).toEqual(1);
        expect(actual[0]).toEqual(new Person(1, 'name', 20, 'https://image.tmdb.org/t/p/w500/1.jpg'));
    });

    it('findFilmsByPerson test', async () => {
        let actualUrl: any;
        window.fetch = (url) => {
            actualUrl = url;
            // @ts-ignore
            return new Promise((s) => s({
                status: 200,
                json: () => new Promise((s2) => s2({
                    cast: [{
                        id: 1,
                        title: 'title',
                        overview: 'overview',
                        poster_path: '2.jpg',
                        popularity: 30,
                        vote_count: 1,
                        vote_average: 2,
                        release_date: '2051-08-09T05:06:07Z',
                    }],
                })),
            }));
        };

        const service = new TMDBApi();
        const actual = await service.findFilmsByPerson(8);

        expect(actualUrl).toContain('https://api.themoviedb.org/3/person/8/movie_credits?');
        expect(actual.length).toEqual(1);
        expect(actual[0]).toEqual(new Film(1, 'title', 'overview', 'https://image.tmdb.org/t/p/w500/2.jpg',
            30, 1, 2, new Date('2051-08-09T05:06:07Z')));
    });
});
