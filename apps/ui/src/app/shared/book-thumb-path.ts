export function bookThumbSrc(filePath: string) {
    return `zip-thumb://${encodeURIComponent(filePath)}`;
}

export function bookThumbCssSrc(filePath: string) {
    return `url("${bookThumbSrc(filePath)}")`;
}
