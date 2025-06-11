export interface LazyValue<T> {
    (): T;
    set: (newVal: T) => void;
}

export function createLazyValue<T>(): LazyValue<T> {
    let val: T;
    const fn = (() => val) as LazyValue<T>;
    fn.set = (newVal: T) => {
        val = newVal;
    };
    return fn;
}
