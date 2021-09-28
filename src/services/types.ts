export interface ProgressCallback {
    update(ready: number, total: number): void;
}
