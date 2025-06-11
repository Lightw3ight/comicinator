export interface Book {
    id: number;
    dateAdded: Date;
    filePath: string;
    title: string;
    series?: string;
    number?: string;
    volume?: number;
    summary?: string;
    notes?: string;
    coverDate?: Date;
    writer?: string;
    penciler?: string;
    inker?: string;
    colorist?: string;
    letterer?: string;
    coverArtist?: string;
    editor?: string;
    publisherId?: number;
    pageCount?: number;
    currentPage?: number;
    lastOpened?: Date;
    fileSize?: number;
    externalUrl?: string;
    externalId?: number;
    frontCover?: string;
}
