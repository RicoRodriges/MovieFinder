export async function get(url: string, params?: { [k: string]: string }) {
    const requestParams = (params)
        ? '?' + Object.entries(params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&')
        : '';
    try {
        return await fetch(url + requestParams);
    } catch (e) {
        console.error(e);
        debugger
        throw e
    }
}

/**
 * Executes actions in parallel and reduces server load
 * @param size max parallel actions
 */
export async function batch<T>(actions: (() => Promise<T>)[], size: number, pause = 200): Promise<T[]> {
    let result: T[] = [];

    let batch: Promise<T>[] = [];
    for (const v of actions) {
        batch.push(v());
        if (batch.length >= size) {
            result = result.concat(await Promise.all(batch));
            await sleep(pause);
            batch = [];
        }
    }

    if (batch.length > 0) {
        result = result.concat(await Promise.all(batch));
    }
    return result;
}

export async function sleep(timeout: number) {
    await new Promise((resolve) => setTimeout(resolve, timeout));
}
