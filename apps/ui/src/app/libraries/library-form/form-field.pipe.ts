import { Pipe, PipeTransform } from '@angular/core';
import {
    FILTER_FIELD_OPTIONS,
    FilterFormFieldType,
} from './filter-field-details';

@Pipe({
    name: 'formField',
})
export class FormFieldPipe implements PipeTransform {
    public transform(field: string): FilterFormFieldType {
        return FILTER_FIELD_OPTIONS[field]?.formField ?? 'text';
    }
}
