import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';

export function getSqlHandlers(
    dbLoader: Promise<Database<sqlite3.Database, sqlite3.Statement>>
) {
    return {
        async saveBlob(statement: string, image: Uint8Array, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);
            await stmt.run(image, ...args);
        },

        // async loadBlob(statement: string, ...args: any[]) {
        //     const db = await dbLoader;
        //     const stmt = await db.prepare(statement);
        //     const result = await stmt.get(...args);

        //     return result;
        // },

        async select(statement: string, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);
            const result = await stmt.get(...args);

            return result;
        },

        async selectAll(statement: string, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);
            const results = await stmt.all(...args);
            return results;
        },

        async run(statement: string, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);

            const img = args[0]?.['@image'];

            if (img && img instanceof ArrayBuffer) {
                console.log('convert to blob');
                args[0]['@image'] = new Blob([img], { type: 'image/jpeg' });
            }

            const result = stmt.run(...args);
            return (await result).lastID;
        },

        async transaction(
            statements: (string | { sql: string; args: any[] })[]
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
                        await stmt.run(...(item.args ?? []));
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
