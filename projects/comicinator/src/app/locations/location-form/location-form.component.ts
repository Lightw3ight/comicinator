import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal } from '@angular/core';
import {
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { LocationResult } from '../../core/api/comic-vine/models/location-result.interface';
import { AbortedImport } from '../../core/importers/aborted-import';
import { ImporterService } from '../../core/importers/importer.service';
import { MessagingService } from '../../core/messaging/messaging.service';
import { Location } from '../../core/models/location.interface';
import { LocationsStore } from '../../core/store/locations/locations.store';
import { PublishersStore } from '../../core/store/publishers/publishers.store';
import { SettingsStore } from '../../core/store/settings/settings.store';
import { ProgressTakeoverComponent } from '../../shared/progress-takeover/progress-takeover.component';
import { LocationSearchResultsComponent } from './location-search-results/location-search-results.component';

@Component({
    selector: 'cbx-location-form',
    templateUrl: 'location-form.component.html',
    styleUrl: 'location-form.component.scss',
    providers: [provideNativeDateAdapter()],
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButtonModule,
        ReactiveFormsModule,
        MatIconButton,
        MatIcon,
        MatDatepickerModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        ProgressTakeoverComponent,
        CdkDrag,
    ],
})
export class LocationFormComponent {
    private dialog = inject(MatDialog);
    private locationsStore = inject(LocationsStore);
    private settingsStore = inject(SettingsStore);
    private publishersStore = inject(PublishersStore);
    private importerService = inject(ImporterService);
    private messagingService = inject(MessagingService);
    private dialogRef = inject(MatDialogRef<LocationFormComponent>);
    private formBuilder = inject(NonNullableFormBuilder);
    protected location = inject<Location>(MAT_DIALOG_DATA, { optional: true });

    protected importing = signal<boolean>(false);
    protected progressText = signal<string | undefined>(undefined);

    protected publishers = this.publishersStore.entities;
    protected imageUrl = signal<string | undefined>(undefined);
    protected imageBlob = signal<Blob | undefined>(undefined);
    protected form = this.createForm();
    protected showSearch = computed(
        () => !!this.settingsStore.settings.apiKey(),
    );

    protected async save() {
        if (this.location != null) {
            const { image, dateAdded, ...location } = this.location;

            await this.locationsStore.updateLocation(this.location.id, {
                ...location,
                ...this.form.value,
                image: this.imageBlob(),
                id: this.location.id,
            });
            this.dialogRef.close();
        }
    }

    protected async search() {
        const name = this.form.value.name;

        if (name) {
            const ref = this.dialog.open(LocationSearchResultsComponent, {
                data: name,
                minWidth: 800,
                minHeight: 200,
            });

            const result: LocationResult = await firstValueFrom(
                ref.afterClosed(),
            );

            if (result) {
                await this.applyApiResult(result);
            }
        }
    }

    private async applyApiResult(result: LocationResult) {
        this.importing.set(true);
        this.dialogRef.disableClose = true;

        try {
            const { location, image } =
                await this.importerService.importLocation(result, (progress) =>
                    this.progressText.set(progress),
                );
            this.setImage(image);

            this.form.patchValue({
                ...location,
            });
        } catch (err: unknown) {
            if (err instanceof AbortedImport) {
                await this.messagingService.warning(err.message);
            } else {
                await this.messagingService.error(
                    'An error occurred while importing location details',
                );
            }
        } finally {
            this.dialogRef.disableClose = false;
            this.importing.set(false);
        }
    }

    private setImage(image: Blob | undefined) {
        const existing = this.imageUrl();

        if (existing) {
            URL.revokeObjectURL(existing);
        }

        if (image) {
            this.imageBlob.set(image);
            this.imageUrl.set(URL.createObjectURL(image));
        } else {
            this.imageBlob.set(undefined);
            this.imageUrl.set(undefined);
        }
    }

    private createForm() {
        const form = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            externalUrl: [''],
            externalId: [undefined as number | undefined],
        });

        if (this.location) {
            this.setImage(this.location.image);
            form.patchValue(this.location);
            form.markAsPristine();
        }

        return form;
    }
}
