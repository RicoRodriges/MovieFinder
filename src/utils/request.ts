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
 * @param size max parallel actions
 */
export async function batch<T>(
  actions: (() => Promise<T>)[],
  size: number,
  pause = 200,
): Promise<T[]> {
  let result: T[] = [];

  /* eslint-disable no-await-in-loop */
  for (let start = 0; start < actions.length; start += size) {
    const chunk = actions.slice(start, start + size).map((v) => v());
    result = result.concat(await Promise.all(chunk));
    await sleep(pause);
  }

  return result;
}
