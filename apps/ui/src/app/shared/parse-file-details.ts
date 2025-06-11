export interface ParsedFileDetails {
    filePath: string;
    fileName: string;
    series?: string;
    issueNumber?: string;
    year?: string;
}

const FILE_NAME_RX = /^(.*?) (\d{1,3}) \((\d{4})\)/;

export function parseFileDetails(filePath: string): ParsedFileDetails {
    filePath = filePath.replaceAll('/', '\\');
    let fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    const match = fileName.match(FILE_NAME_RX);

    if (match) {
        return {
            filePath,
            fileName,
            series: match[1],
            issueNumber: match[2],
            year: match[3],
        };
    }

    return {
        filePath,
        fileName,
    };
}
