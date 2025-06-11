import { DestroyRef, ElementRef, inject, signal } from '@angular/core';

export interface ElementSize {
    width: number;
    height: number;
    x: number;
    y: number;
}

export function observeSize() {
    const elRef = inject<ElementRef<HTMLElement>>(ElementRef);
    const destroyRef = inject(DestroyRef);
    const value = signal<ElementSize | null>(null);

    const observer = new ResizeObserver(([entry]) => {
        const { width, height, x, y } = entry.contentRect;
        const existing = value();
        if (existing && existing.width === width && existing.height === height) {
            return;
        }
        value.set({ width, height, x, y });
    });

    observer.observe(elRef.nativeElement);
    destroyRef.onDestroy(() => observer.disconnect());

    return value.asReadonly();
}
