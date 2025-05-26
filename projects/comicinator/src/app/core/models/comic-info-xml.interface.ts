export interface ComicInfoXml {
    Title: string;
    Series?: string;
    Number?: string;
    Volume?: string;
    Summary?: string;
    Editor?: string;
    Notes?: string;
    Year?: string;
    Month?: string;
    Day?: string;
    Writer?: string;
    Penciller?: string;
    Inker?: string;
    Colorist?: string;
    Letterer?: string;
    CoverArtist?: string;
    Publisher?: string;
    Web?: string;
    PageCount?: string;
    Characters?: string;
    Teams?: string;
    Locations?: string;
    ScanInformation?: string;
    Pages?: ComicInfoXmlPage[];
}

export interface ComicInfoXmlPage {
    Image: string;
    ImageSize: string;
    ImageWidth: string;
    ImageHeight: string;
    Type?: string;
}
