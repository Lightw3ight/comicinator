import fs from 'fs';

export async function exists(path: string) {
    try {
        await fs.promises.access(path);
    } catch (er) {
        console.log('access error', er);
        return false;
    }

    return true;
}
