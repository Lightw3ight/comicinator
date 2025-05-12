const JPG_EXT = ['.jpg', '.jpeg', '.png'];

export function isImage(filePath: string) {
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLocaleLowerCase();
    return JPG_EXT.includes(ext);
}