import { Pipe, PipeTransform } from '@angular/core';
import { FilterOperator } from '../../core/models/filter-operator.type';

@Pipe({
    name: 'operatorDisplayName',
})
export class OperatorDisplayNamePipe implements PipeTransform {
    public transform(op: FilterOperator | undefined): string {
        if (op == null) {
            return '';
        }

        switch (op) {
            case 'contains':
                return 'Contains';
            case 'ends':
                return 'Ends with';
            case 'eq':
                return 'Equals';
            case 'gt':
                return 'Greater than';
            case 'lt':
                return 'Less than';
            case 'ne':
                return 'Does not equal';
            case 'starts':
                return 'Starts with';
            case 'gte':
                return 'Greater than or equal';
            case 'like':
                return 'Like';
            case 'lte':
                return 'Less than or equal';
            case 'not-ends':
                return 'Does not end with';
            case 'not-starts':
                return 'Does not start with';
        }
    }
}
