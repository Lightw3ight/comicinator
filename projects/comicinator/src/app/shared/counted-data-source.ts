import { DataSource } from '@angular/cdk/collections';

export abstract class CountedDataSource<T> extends DataSource<T> {
    abstract readonly columnCount: number;
}
