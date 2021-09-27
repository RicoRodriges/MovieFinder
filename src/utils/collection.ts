export function* zip<A, B>(a: A[], b: B[]) {
    if (a.length !== b.length) throw new Error('Arrays must have same length');

    for (let i = 0; i < a.length; ++i) {
        yield [a[i], b[i]] as [A, B];
    }
}