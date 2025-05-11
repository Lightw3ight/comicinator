export interface LazyValue<T> {
    (): T | null;
    set: (newVal: T) => void;
}

export function createLazyValue<T>(): LazyValue<T> {
    let val: T | null;
    const fn = (() => val) as LazyValue<T>;
    fn.set = (newVal: T) => { val = newVal };
    return fn;
}