export function chunkItems<T>(items: T[], chunkSize: number) {
    return items.reduce<T[][]>((acc, item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);
        acc[chunkIndex] = acc[chunkIndex] ?? [];
        acc[chunkIndex].push(item);
        return acc;
    }, []);
}
