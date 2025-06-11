import { Dictionary } from '../models/dictionary.interface';
import { SqlStatement } from '../models/sql-statement.interface';
import { Table } from './table';

export class QueryGenerator<T extends object> {
    constructor(private table: Table<T>) {}

    // public select(): SqlStatement;
    // public select(where: Partial<T>): SqlStatement;
    // public select(fields: (keyof T)[] | '*', where: Partial<T>): SqlStatement;

    public select(
        fields: (keyof T)[] | '*' | keyof T,
        args?: Partial<T> | Partial<T>[],
        orderBy?: keyof T,
        orderDirection?: 'asc' | 'desc',
    ): SqlStatement {
        const fieldString = Array.isArray(fields) ? fields.join(', ') : fields;

        let query = `select ${fieldString.toString()} from ${
            this.table.name
        }${this.where(args)}`;

        if (orderBy) {
            query =
                query +
                ` ORDER BY ${orderBy.toString()} ${orderDirection ?? 'asc'}`;
        }

        return { sql: query, args: this.createSqlParams(args) };
    }

    public delete(args: Partial<T>): SqlStatement {
        const query = `DELETE from ${this.table.name}${this.where(args)}`;

        return { sql: query, args: this.createSqlParams(args) };
    }

    public insert(args: Partial<T>): SqlStatement {
        const fieldNames = Object.keys(args);
        const fields = fieldNames.join(', ');
        const aliases = fieldNames.map((o) => `@${o}`).join(', ');
        const query = `INSERT INTO ${this.table.name}(${fields}) VALUES(${aliases})`;

        return { sql: query, args: this.createSqlParams(args) };
    }

    public update(where: Partial<T>, args: Partial<T>): SqlStatement {
        const fieldNames = Object.keys(args);
        const fields = fieldNames.map((o) => `${o} = @${o}`).join();

        const query = `UPDATE ${this.table.name} SET ${fields}${this.where(
            where,
        )}`;

        return {
            sql: query,
            args: this.createSqlParams({ ...args, ...where }),
        };
    }

    private where(args: Partial<T> | Partial<T>[] | undefined) {
        if (!args) {
            return '';
        }

        const groups = Array.isArray(args) ? args : [args];

        const groupStatements = groups.map((group) => {
            return Object.entries(group)
                .map(([key, value]) => {
                    let operator = '=';

                    if (
                        typeof value === 'string' &&
                        (value.startsWith('%') || value.endsWith('%'))
                    ) {
                        operator = 'LIKE';
                    }

                    return `${key} ${operator} @${key}`;
                })
                .join(' AND ');
        });

        let [whereStatement] = groupStatements;

        if (groupStatements.length > 1) {
            whereStatement = groupStatements
                .map((statement) => `(${statement})`)
                .join(' OR ');
        }

        return ` WHERE ${whereStatement}`;
    }

    public groupBy(
        field: keyof T,
        selectMap: Dictionary<string | undefined>,
        where?: Partial<T>,
    ): SqlStatement {
        const selects = Object.entries(selectMap)
            .map(([key, value]) => (value == null ? key : `${value} as ${key}`))
            .join(', ');

        let query = `SELECT ${selects} from ${
            this.table.name
        } GROUP BY ${field.toString()}`;

        return { sql: query };
    }

    public createSqlParams(
        obj: Record<any, any> | Record<any, any>[] | undefined,
    ): { [key: string]: any } | undefined {
        if (obj == null) {
            return undefined;
        }

        let all: Record<any, any>;

        if (Array.isArray(obj)) {
            all = obj.reduce((acc, item) => ({ ...acc, ...item }), {});
        } else {
            all = obj;
        }

        return Object.keys(all).reduce((acc, key) => {
            let val = all[key];

            if (val instanceof Date) {
                val = val.toISOString();
            }

            return { ...acc, [`@${key}`]: val };
        }, {});
    }
}
