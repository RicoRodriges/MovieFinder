import { tmdbApi } from '@/api/tmdb';
import { Language } from '@/models/Language';
import Movie from '@/models/Movie';
import Person from '@/models/Person';
import { exportToCsv, importFromCsv } from '@/utils/csv';
import { download, uploadText } from '@/utils/file';
import { batch } from '@/utils/request';

export default class SetService {

    protected readonly api = tmdbApi;
    protected static readonly MAX_ACTIONS = 5;
    protected static readonly ID_COLUMN = 'ID';

    private async exportToFile<T>(items: T[], filename: string, toID: (v: T) => string, toName: (v: T) => string) {
        const data = [[SetService.ID_COLUMN, 'Name']];
        for (const it of items) {
            data.push([toID(it), toName(it)]);
        }
        const csv = exportToCsv(data);
        download(csv, filename, 'text/csv');
    }

    private async importFromFile<T>(query: (id: number) => Promise<T | undefined>): Promise<T[] | undefined> {
        const text = await uploadText();
        const csv = importFromCsv(text);
        const headers = csv.shift();
        const idIndex = headers?.indexOf(SetService.ID_COLUMN);

        if (idIndex !== undefined && idIndex >= 0) {
            const ids = new Set<number>();

            const idRegExp = /^[0-9]+$/;
            for (const r of csv) {
                if (r.length > idIndex && idRegExp.test(r[idIndex])) {
                    ids.add(parseInt(r[idIndex]));
                }
            }

            if (ids.size > 0) {
                const actions = [...ids].map(id => () => query(id))
                const items = await batch(actions, SetService.MAX_ACTIONS);
                return items.filter(v => v !== undefined) as T[];
            }
        }
        return undefined;
    }

    public async exportPersonSetToFile(persons: Person[], filename: string) {
        this.exportToFile(persons, filename, p => p.id.toString(), p => p.name);
    }

    public async importPersonSetFromFile(lang: Language): Promise<Person[] | undefined> {
        return this.importFromFile(id => this.api.getPerson(id, lang).then(p => p?.toPerson()))
    }

    public async exportMovieSetToFile(movies: Movie[], filename: string) {
        this.exportToFile(movies, filename, m => m.id.toString(), m => m.title);
    }

    public async importMovieSetFromFile(lang: Language): Promise<Movie[] | undefined> {
        return this.importFromFile(id => this.api.getMovie(id, lang).then(m => m?.toMovie()))
    }

}

export const setService = new SetService();