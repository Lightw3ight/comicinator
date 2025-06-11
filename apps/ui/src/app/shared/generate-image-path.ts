export function generateImagePath(
    id: number,
    type: 'char' | 'team' | 'loc',
    timeStamp?: Date,
) {
    const ts = timeStamp ? `?${timeStamp.getTime()}` : '';
    return `${type}-img://${id}${ts}`;
}

export function generateImageCssSrc(
    id: number,
    type: 'char' | 'team' | 'loc',
    timeStamp?: Date,
) {
    return `url("${generateImagePath(id, type, timeStamp)}")`;
}
