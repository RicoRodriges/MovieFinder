import TMDBApi from '@/services/TMDBApi';
import Person from '@/models/Person';

export default class StorageService {
    public static getInstance() {
        if (!this.instance) {
            this.instance = new StorageService();
        }
        return this.instance;
    }

    private static instance: StorageService;

    private static readonly ACTOR_LIST = 'actorList';
    private static readonly FAVORITE_LIST = 'favoriteList';

    private storage = window.localStorage;
    private api = TMDBApi.getInstance();

    public setActorList(list: Person[]) {
        this.storage.setItem(StorageService.ACTOR_LIST, JSON.stringify(list.map((p) => p.id)));
    }

    public async getActorList(): Promise<Person[]> {
        const list = this.storage.getItem(StorageService.ACTOR_LIST);
        if (list != null) {
            const personIds: number[] = JSON.parse(list);
            return Promise.all(personIds.map((pid) => this.api.getPerson(pid)))
                .then((people) => people.filter((p) => p != null) as Person[]);
        }
        return [];
    }

}
