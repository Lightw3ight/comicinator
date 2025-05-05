export interface Book {
    id: number;
    filePath: string;
    title: string;
    series: string;
    number: number;
    volume: number;
    summary: string;
    notes: string;
    year: number;
    month: number;
    day: number;
    writer: string;
    penciler: string;
    inker: string;
    colorist: string;
    letterer: string;
    coverArtist: string;
    editor: string;
    publisher: string;
    pageCount: number;
    dateAdded: Date;
    fileSize: number;
}