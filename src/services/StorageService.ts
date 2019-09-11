import Person from '@/models/Person';
import Movie from '@/models/Movie';

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

    public setActorList(list: Person[]) {
        this.storage.setItem(StorageService.ACTOR_LIST, JSON.stringify(list));
    }

    public getActorList(): Person[] {
        const list = this.storage.getItem(StorageService.ACTOR_LIST);
        if (list != null) {
            return JSON.parse(list);
        }
        return [];
    }

    public addToFavorite(movie: Movie) {
        if (!this.isFavorite(movie.id)) {
            const favorites = this.getFavorites();
            favorites.push(movie);
            this.setFavorites(favorites);
        }
    }

    public isFavorite(movieId: number) {
        return this.getFavorites()
            .some((movie) => movie.id === movieId);
    }

    public removeFromFavorite(movieId: number) {
        this.setFavorites(
            this.getFavorites()
                .filter((movie) => movie.id !== movieId),
        );
    }

    public getFavorites(): Movie[] {
        const list = this.storage.getItem(StorageService.FAVORITE_LIST);
        return (list != null) ? JSON.parse(list) : [];
    }

    private setFavorites(list: Movie[]) {
        this.storage.setItem(StorageService.FAVORITE_LIST, JSON.stringify(list));
    }

}
