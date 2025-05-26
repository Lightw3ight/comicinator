import { Component, computed, inject, signal, Signal } from '@angular/core';
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
import { CharacterResult } from '../../core/api/comic-vine/models/character-result.interface';
import { ItemBase } from '../../core/api/comic-vine/models/item-base.interface';
import { AbortedImport } from '../../core/importers/aborted-import';
import { ImporterService } from '../../core/importers/importer.service';
import { MessagingService } from '../../core/messaging/messaging.service';
import { Character } from '../../core/models/character.interface';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { PublishersStore } from '../../core/store/publishers/publishers.store';
import { SettingsStore } from '../../core/store/settings/settings.store';
import { ProgressTakeoverComponent } from '../../shared/progress-takeover/progress-takeover.component';
import { CharacerSearchResultsComponent } from './character-search-results/character-search-results.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { TeamsStore } from '../../core/store/teams/teams.store';
import { MatTabsModule } from '@angular/material/tabs';
import { TeamSelectorComponent } from '../../shared/team-selector/team-selector.component';

@Component({
    selector: 'cbx-character-form',
    templateUrl: 'character-form.component.html',
    styleUrl: 'character-form.component.scss',
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
        MatTabsModule,
        TeamSelectorComponent,
    ],
})
export class CharacterFormComponent {
    private dialog = inject(MatDialog);
    private charactersStore = inject(CharactersStore);
    private settingsStore = inject(SettingsStore);
    private publishersStore = inject(PublishersStore);
    public teamsStore = inject(TeamsStore);
    private importerService = inject(ImporterService);
    private dialogRef = inject(MatDialogRef<CharacterFormComponent>);
    private formBuilder = inject(NonNullableFormBuilder);
    protected characterId = inject<number>(MAT_DIALOG_DATA, { optional: true });
    private messagingService = inject(MessagingService);

    protected importing = signal<boolean>(false);
    protected progressText = signal<string | undefined>(undefined);
    protected publishers = this.publishersStore.entities;
    protected character = this.computeCharacter();
    protected title = this.computeTitle();
    protected imageUrl = signal<string | undefined>(undefined);
    protected imageBlob = signal<Blob | undefined>(undefined);
    protected form = this.createForm();
    protected showSearch = computed(
        () => !!this.settingsStore.settings.apiKey(),
    );

    public async ngOnInit() {
        if (this.characterId) {
            const teamIds = await this.teamsStore.selectIdsByCharacter(
                this.characterId,
            );
            this.form.patchValue({
                teamIds: teamIds,
            });
            this.form.markAsPristine();
        }
    }

    protected async save() {
        const { teamIds, ...formValue } = this.form.value;

        if (this.characterId != null) {
            const { image, dateAdded, ...character } = this.character()!;

            await this.charactersStore.updateCharacter(
                this.characterId,
                {
                    ...character,
                    ...formValue,
                    image: this.imageBlob(),
                    id: this.characterId,
                },
                teamIds ?? [],
            );
            this.dialogRef.close();
        }
    }

    protected async search() {
        const name = this.form.value.name;

        if (name) {
            const ref = this.dialog.open(CharacerSearchResultsComponent, {
                data: name,
                minWidth: 700,
                minHeight: 200,
            });
            const result: CharacterResult = await firstValueFrom(
                ref.afterClosed(),
            );
            if (result) {
                console.log('selected item', result);
                await this.applyApiResult(result);
            }
        }
    }

    private async applyApiResult(result: CharacterResult) {
        this.importing.set(true);

        try {
            const { character, image, teamIds } =
                await this.importerService.importCharacter(result);

            this.setImage(image);

            this.form.patchValue({
                ...character,
                teamIds,
            });
        } catch (err: unknown) {
            if (err instanceof AbortedImport) {
                await this.messagingService.warning(err.message);
            } else {
                await this.messagingService.error(
                    'An error occurred while importing character details',
                );
            }
        } finally {
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

    private computeTitle() {
        return computed(() => {
            const char = this.character();
            return char ? char.name : 'New Character';
        });
    }

    private computeCharacter(): Signal<Character | null> {
        return computed(() => {
            if (this.characterId) {
                return this.charactersStore.entityMap()[this.characterId];
            }

            return null;
        });
    }

    private createForm() {
        const form = this.formBuilder.group({
            name: ['', Validators.required],
            realName: [''],
            aliases: [''],
            creators: [''],
            summary: [''],
            description: [''],
            origin: [''],
            powers: [''],
            publisherId: [undefined as number | undefined],
            externalUrl: [''],
            birthDate: [undefined as Date | undefined],
            gender: [undefined as number | undefined],
            externalId: [undefined as number | undefined],
            teamIds: [[] as number[]],
        });

        const char = this.character();

        if (char) {
            this.setImage(char.image);
            form.patchValue(char);
            form.markAsPristine();
        }

        return form;
    }
}
