export interface CharacterDto {
    id: number;
    name: string;
    aliases?: string;
    creators?: string;
    summary?: string;
    description?: string;
    gender?: string;
    origin?: string;
    powers?: string;
    publisher?: string;
    realName?: string;
    image: ArrayBuffer;
}
