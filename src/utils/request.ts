export async function get(url: string, params?: { [k: string]: string }): Promise<Response> {
  const requestParams = (params)
    ? `?${Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')}`
    : '';
  try {
    return await fetch(url + requestParams);
  } catch (e) {
    console.error(e);
    debugger;
    throw e;
  }
}

export async function sleep(timeout: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Executes actions in parallel and reduces server load
 * @param chunkSize max parallel actions
 * @returns fixed size chinks
 */
export async function* batchAsyncGenerator<T>(
  actions: (() => Promise<T>)[],
  chunkSize: number,
  pause = 200,
): AsyncGenerator<T[]> {
  /* eslint-disable no-await-in-loop */
  for (let start = 0; start < actions.length; start += chunkSize) {
    const chunk = actions.slice(start, start + chunkSize).map((v) => v());
    yield await Promise.all(chunk);
    await sleep(pause);
  }
  /* eslint-enable no-await-in-loop */
}
