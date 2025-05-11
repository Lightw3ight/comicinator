import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';

export function getSqlHandlers(
    dbLoader: Promise<Database<sqlite3.Database, sqlite3.Statement>>
) {
    return {
        async select(statement: string, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);
            return await stmt.get(...args);
        },

        async selectAll(statement: string, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);
            return await stmt.all(...args);
        },

        async run(statement: string, ...args: any[]) {
            const db = await dbLoader;
            const stmt = await db.prepare(statement);
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
        }
    };
}
