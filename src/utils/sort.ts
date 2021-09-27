export default function multiSort(array: any[], ...sortKeys: string[]) {
    if (!sortKeys.length) {
        return array;
    }

    const keySort = (a: any, b: any, direction: number) => {
        direction = direction !== null ? direction : 1;

        if (a === b) {
            return 0;
        }
        if (a !== undefined && b === undefined || a !== null && b === null) {
            return direction;
        }

        return a > b ? direction : -1 * direction;
    };

    return array.sort((a, b) => {
        let sorted = 0;

        for (let index = 0; sorted === 0 && index < sortKeys.length; ++index) {
            const direction = sortKeys[index].endsWith(':desc') ? -1 : 1;
            const keyPath = sortKeys[index].replace(/:desc$/i, '').replace(/:asc$/i, '');
            const aVal = getValue(a, keyPath);
            const bVal = getValue(b, keyPath);

            sorted = keySort(aVal, bVal, direction);
        }
        return sorted;
    });
}

function getValue(item: any, keyPath: string) {
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
