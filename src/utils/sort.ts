/* eslint-disable @typescript-eslint/no-explicit-any */

function sort(a: any, b: any, direction: -1 | 1): -1 | 0 | 1 {
  if (a === b) {
    return 0;
  }
  if ((a !== undefined && b === undefined) || (a !== null && b === null)) {
    return direction;
  }

  return a > b ? direction : (-1 * direction as (1 | -1));
}

function getValue(item: any, keyPath: string): any {
  const keys = keyPath.split('.');
  let res = item;
  keys.every((key) => {
    if (res === undefined || res === null) {
      return false;
    }
    res = res[key];
    return true;
  });
  return res;
}

export default function multiSort<T>(array: T[], ...sortKeys: string[]): T[] {
  if (!sortKeys.length) {
    return array;
  }

  return array.sort((a, b) => {
    let sorted: -1 | 0 | 1 = 0;

    for (let index = 0; sorted === 0 && index < sortKeys.length; ++index) {
      const direction = sortKeys[index].endsWith(':desc') ? -1 : 1;
      const keyPath = sortKeys[index].replace(/:desc$/i, '').replace(/:asc$/i, '');
      const aVal = getValue(a, keyPath);
      const bVal = getValue(b, keyPath);

      sorted = sort(aVal, bVal, direction);
    }
    return sorted;
  });
}
