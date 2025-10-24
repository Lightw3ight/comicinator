
import { Component, effect, inject } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import {
    MatError,
    MatFormField,
    MatLabel,
    MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { FileSystemService } from '../core/file-system.service';
import { AppSettings } from '../core/models/app-settings.interface';
import { SettingsStore } from '../core/store/settings/settings.store';

@Component({
    selector: 'cbx-app-settings',
    templateUrl: 'app-settings.component.html',
    styleUrl: 'app-settings.component.scss',
    imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatSuffix,
    MatLabel,
    MatError,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatTabGroup,
    MatTab
],
})
export class AppSettingsComponent {
    readonly dialogRef = inject(MatDialogRef<AppSettingsComponent>);
    private fb = inject(FormBuilder);
    private settingsStore = inject(SettingsStore);
    private fileSystemService = inject(FileSystemService);

    protected form = this.buildForm();

    constructor() {
        effect(() => {
            this.form.patchValue(this.settingsStore.settings());
        });
    }

    protected async chooseLibraryPath() {
        const path = await this.fileSystemService.openDirectory(
            this.form.value.libraryPath ?? undefined
        );

        if (path) {
            this.form.controls.libraryPath.setValue(path);
        }
    }

    protected async save() {
        if (this.form.valid) {
            const settings = this.form.value as Partial<AppSettings>;
            await this.settingsStore.saveSettings(settings);
            this.dialogRef.close();
        }
    }

    protected close() {
        this.dialogRef.close();
    }

    private buildForm() {
        return this.fb.group({
            libraryPath: ['', [Validators.required], [this.validatePath()]],
            apiKey: [''],
            filePattern: [''],
            folderPattern: [''],
        });
    }

    private validatePath(): AsyncValidatorFn {
        return async (control: AbstractControl) => {
            const value: string | undefined = control.value;

            if (value == null || value.trim().length === 0) {
                return null;
            }

            const exists = await this.fileSystemService.exists(value);
            return exists ? null : { path: true };
        };
    }
}
