import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';

export function getSqlHandlers(
    dbLoader: Promise<Database<sqlite3.Database, sqlite3.Statement>>,
) {
    async function select(statement: string, ...args: any[]) {
        const db = await dbLoader;
        const stmt = await db.prepare(statement);
        const result = await stmt.get(...args);

        return result;
    }

    async function run(statement: string, ...args: any[]) {
        const db = await dbLoader;
        const stmt = await db.prepare(statement);

        const img = args[0]?.['@image'];

        if (img && img instanceof ArrayBuffer) {
            console.log('convert to blob');
            args[0]['@image'] = new Blob([img], { type: 'image/jpeg' });
        }

        const result = await stmt.run(...args);
        return result.lastID;
    }

    return {
        select,
        run,

        async saveBlob(statement: string, image: Uint8Array, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);
            await stmt.run(image, ...args);
        },

        async deleteBook(bookId: number, deleteFile: boolean) {
            if (deleteFile) {
                const { filePath } = await select(
                    'SELECT filePath FROM Book WHERE id = ?',
                    bookId,
                );

                await fs.promises.unlink(filePath);
            }

            await run('DELETE FROM Book WHERE id = ?', bookId);
        },

        async selectAll(statement: string, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);
            const results = await stmt.all(...args);
            return results;
        },

        async transaction(
            statements: (string | { sql: string; args: any[] | any })[],
        ) {
            const db = await dbLoader;

            try {
                await db.run('BEGIN TRANSACTION;');

                for (const item of statements) {
                    if (typeof item === 'string') {
                        const stmt = await db.prepare(item);
                        await stmt.run();
                    } else {
                        const stmt = await db.prepare(item.sql);
                        let args: any | undefined;
                        if (item.args) {
                            args = Array.isArray(item.args)
                                ? item.args
                                : [item.args];
                        }
                        await stmt.run(...(args ?? []));
                    }
                }
            } catch (error) {
                await db.run('ROLLBACK;');
                throw error;
            }

            await db.run('COMMIT');
        },
    };
}
