import {
    Component,
    computed,
    inject,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { firstValueFrom } from 'rxjs';
import { TeamResult } from '../../core/api/comic-vine/models/team-result.interface';
import { AbortedImport } from '../../core/importers/aborted-import';
import { ImporterService } from '../../core/importers/importer.service';
import { MessagingService } from '../../core/messaging/messaging.service';
import { Team } from '../../core/models/team.interface';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { PublishersStore } from '../../core/store/publishers/publishers.store';
import { SettingsStore } from '../../core/store/settings/settings.store';
import { TeamsStore } from '../../core/store/teams/teams.store';
import { CharacterSelectorComponent } from '../../shared/character-selector/character-selector.component';
import { ProgressTakeoverComponent } from '../../shared/progress-takeover/progress-takeover.component';
import { TeamSearchResultsComponent } from './team-search-results/team-search-results.component';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
    selector: 'cbx-team-form',
    templateUrl: 'team-form.component.html',
    styleUrl: 'team-form.component.scss',
    providers: [provideNativeDateAdapter()],
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButtonModule,
        ReactiveFormsModule,
        MatIcon,
        MatDatepickerModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatTabsModule,
        CharacterSelectorComponent,
        ProgressTakeoverComponent,
        CdkDrag,
    ],
})
export class TeamFormComponent implements OnInit, OnDestroy {
    private dialog = inject(MatDialog);
    private charactersStore = inject(CharactersStore);
    private teamsStore = inject(TeamsStore);
    private settingsStore = inject(SettingsStore);
    private publishersStore = inject(PublishersStore);
    private importerService = inject(ImporterService);
    private messagingService = inject(MessagingService);
    private dialogRef = inject(MatDialogRef<TeamFormComponent>);
    private formBuilder = inject(NonNullableFormBuilder);
    protected team = inject<Team>(MAT_DIALOG_DATA, { optional: true });

    protected importing = signal<boolean>(false);
    protected progressText = signal<string | undefined>(undefined);

    protected publishers = this.publishersStore.entities;
    protected imageUrl = signal<string | undefined>(undefined);
    protected imageBlob = signal<Blob | undefined>(undefined);
    protected form = this.createForm();
    protected showSearch = computed(
        () => !!this.settingsStore.settings.apiKey(),
    );

    public async ngOnInit() {
        if (this.team) {
            this.loadImage(this.team.id);

            const characters = await this.charactersStore.searchByTeam(
                this.team.id,
            );

            this.form.patchValue({
                characterIds: characters.map((c) => c.id),
            });
            this.form.markAsPristine();
        }
    }

    public ngOnDestroy(): void {
        this.clearImage();
    }

    private async loadImage(teamId: number) {
        const img = await this.teamsStore.selectImage(teamId);

        if (img) {
            this.setImage(img);
        }
    }

    protected clearImage() {
        this.imageBlob.set(undefined);
        const imgUrl = this.imageUrl();

        if (imgUrl) {
            URL.revokeObjectURL(imgUrl);
            this.imageUrl.set(undefined);
        }
    }

    protected async save() {
        const { characterIds, ...formValue } = this.form.value;

        if (this.team != null) {
            const { dateAdded, ...team } = this.team;

            await this.teamsStore.updateTeam(
                this.team.id,
                {
                    ...team,
                    ...formValue,
                    id: this.team.id,
                },
                this.imageBlob(),
                characterIds ?? [],
            );
            this.dialogRef.close();
        }
    }

    protected async search() {
        const name = this.form.value.name;

        if (name) {
            const ref = this.dialog.open<
                TeamSearchResultsComponent,
                any,
                { result: TeamResult; importMembers: boolean }
            >(TeamSearchResultsComponent, {
                data: name,
                minWidth: 800,
                minHeight: 200,
            });

            const response = await firstValueFrom(ref.afterClosed());

            if (response) {
                await this.applyApiResult(
                    response.result,
                    response.importMembers,
                );
            }
        }
    }

    private async applyApiResult(result: TeamResult, importMembers: boolean) {
        this.importing.set(true);
        this.dialogRef.disableClose = true;

        try {
            const { team, characterIds, image } =
                await this.importerService.importTeam(
                    result,
                    importMembers,
                    (progress) => this.progressText.set(progress),
                );
            this.setImage(image);

            if (characterIds?.length) {
                await this.charactersStore.loadByIds(characterIds);
            }

            this.form.patchValue({
                ...team,
                characterIds: characterIds ?? this.form.value.characterIds,
            });
        } catch (err: unknown) {
            if (err instanceof AbortedImport) {
                await this.messagingService.warning(err.message);
            } else {
                await this.messagingService.error(
                    'An error occurred while importing team details',
                );
            }
        } finally {
            this.dialogRef.disableClose = false;
            this.importing.set(false);
        }
    }

    private setImage(image: Blob | undefined) {
        this.clearImage();

        if (image) {
            this.imageBlob.set(image);
            this.imageUrl.set(URL.createObjectURL(image));
        }
    }

    private createForm() {
        const form = this.formBuilder.group({
            name: ['', Validators.required],
            summary: [''],
            aliases: [''],
            description: [''],
            publisherId: [undefined as number | undefined],
            characterIds: [[] as number[]],
            externalUrl: [''],
            externalId: [undefined as number | undefined],
        });

        if (this.team) {
            form.patchValue(this.team);
            form.markAsPristine();
        }

        return form;
    }
}
