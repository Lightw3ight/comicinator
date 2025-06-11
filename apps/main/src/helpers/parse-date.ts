export function parseDate(value: any | undefined): Date | undefined {
    if (value == null || value == '') {
        return undefined;
    }

    if (!isNaN(value)) {
        return new Date(Number(value));
    }

    return new Date(value);
}
