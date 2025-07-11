export interface Library {
    id: number;
    name: string;
    description?: string;
    lastUpdated: Date;
    dateAdded: Date;
    matchAll: boolean;
    showInQuickList: boolean;
}
