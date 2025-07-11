import { Component, inject } from '@angular/core';
import {
    FormArray,
    FormControl,
    FormGroup,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { Library } from '../../core/models/library.interface';
import {
    MatFormField,
    MatLabel,
    MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FILTER_FIELD_OPTIONS } from './filter-field-details';
import { MatOption, MatSelect } from '@angular/material/select';
import { AvailableOperatorsPipe } from './available-operators.pipe';
import { MatIcon } from '@angular/material/icon';
import { OperatorDisplayNamePipe } from './operator-display-name.pipe';
import { FormFieldPipe } from './form-field.pipe';
import { PublishersStore } from '../../core/store/publishers/publishers.store';
import { LibraryStore } from '../../core/store/library/library.store';
import {
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
} from '@angular/material/datepicker';
import { FilterOperator } from '../../core/models/filter-operator.type';
import { LibraryFilter } from '../../core/models/library-filter.interface';
import { MatCheckbox } from '@angular/material/checkbox';

interface LibraryFilterForm {
    field: FormControl<string>;
    operator: FormControl<FilterOperator>;
    value: FormControl<string>;
}

@Component({
    selector: 'cbx-library-form',
    templateUrl: 'library-form.component.html',
    styleUrl: 'library-form.component.scss',
    imports: [
        ReactiveFormsModule,
        MatDialogTitle,
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatButton,
        MatFormField,
        MatInput,
        MatLabel,
        MatSelect,
        MatOption,
        AvailableOperatorsPipe,
        MatIcon,
        MatIconButton,
        OperatorDisplayNamePipe,
        FormFieldPipe,
        MatDatepicker,
        MatDatepickerToggle,
        MatDatepickerInput,
        MatSuffix,
        MatCheckbox,
    ],
})
export class LibraryFormComponent {
    protected library = inject<Library>(MAT_DIALOG_DATA, { optional: true });
    protected fb = inject(NonNullableFormBuilder);
    protected publisherStore = inject(PublishersStore);
    private libraryStore = inject(LibraryStore);
    private dialogRef = inject(MatDialogRef<LibraryFormComponent>);

    protected availableFields = this.getAvailableFields();
    protected form = this.createForm();
    protected publishers = this.publisherStore.entities;

    protected addFilter() {
        this.form.controls.filters.push(this.createFilterGroup());
    }

    protected removeFilter(index: number) {
        this.form.controls.filters.removeAt(index);
    }

    protected resetFilterValue(filterForm: FormGroup<LibraryFilterForm>) {
        filterForm.controls.value.setValue('');
    }

    private createForm() {
        const form = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            lastUpdated: [new Date()],
            dateAdded: [new Date()],
            matchAll: [true],
            showInQuickList: [false],
            filters: new FormArray<FormGroup<LibraryFilterForm>>([]),
        });

        if (this.library) {
            form.patchValue(this.library);

            this.libraryStore.loadFilters(this.library.id).then(() => {
                const filters = this.libraryStore.filters()[this.library!.id];

                for (const filter of filters) {
                    form.controls.filters.push(this.createFilterGroup(filter));
                }
            });
        }

        return form;
    }

    private createFilterGroup(
        value?: LibraryFilter,
    ): FormGroup<LibraryFilterForm> {
        return this.fb.group({
            field: [value?.field ?? '', Validators.required],
            operator: [
                value?.operator ?? ('eq' as FilterOperator),
                Validators.required,
            ],
            value: [value?.value, Validators.required],
        });
    }

    protected async save() {
        if (this.form.valid && this.form.controls.filters.length > 0) {
            const { filters, ...libraryData } = this.form.getRawValue();
            const library: Omit<Library, 'id'> = {
                ...(this.library ?? {}),
                ...libraryData,
            };

            if (this.library) {
                await this.libraryStore.update(
                    this.library.id,
                    library,
                    filters,
                );
            } else {
                await this.libraryStore.create(library, filters);
            }

            this.dialogRef.close();
        }
    }

    private getAvailableFields() {
        return Object.entries(FILTER_FIELD_OPTIONS).map(([key, value]) => ({
            field: key,
            displayName: value.displayName,
        }));
    }
}
