import { Component, computed, inject, signal, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import {
    MatFormField,
    MatLabel,
    MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { Character } from '../../core/models/character.interface';
import { CharactersStore } from '../../core/store/characters/characters.store';
import { CharacerSearchResultsComponent } from './character-search-results/character-search-results.component';
import { CharacterResult } from '../../core/api/comic-vine/models/character-result.interface';

@Component({
    selector: 'cbx-character-form',
    templateUrl: 'character-form.component.html',
    styleUrl: 'character-form.component.scss',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatSuffix,
        MatIconButton,
        MatIcon,
    ],
})
export class CharacterFormComponent {
    private dialog = inject(MatDialog);
    private charactersStore = inject(CharactersStore);

    private dialogRef = inject(MatDialogRef<CharacterFormComponent>);
    private formBuilder = inject(FormBuilder);
    protected characterId = inject<number>(MAT_DIALOG_DATA, { optional: true });

    protected character = this.computeCharacter();
    protected title = this.computeTitle();
    protected form = this.createForm();
    protected imageUrl = signal<string | undefined>(undefined);
    protected imageBlob = signal<Blob | undefined>(undefined);

    protected async save() {
        const formValue = this.form.value;

        if (this.characterId != null) {
            await this.charactersStore.updateCharacter(this.characterId, {
                image: this.imageBlob(),
                name: formValue.name!,
            });
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
                ref.afterClosed()
            );
            if (result) {
                console.log('selected item', result);
                await this.applyApiResult(result);
            }
        }
    }

    private async applyApiResult(result: CharacterResult) {
        const response = await fetch(result.image.medium_url);
        const image = await response.blob();
        this.setImage(image);
        this.form.setValue({
            name: result.name,
        });
    }

    private setImage(image: Blob) {
        const existing = this.imageUrl();

        if (existing) {
            URL.revokeObjectURL(existing);
        }

        this.imageBlob.set(image);
        this.imageUrl.set(URL.createObjectURL(image));
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
        });

        if (this.character()) {
            form.patchValue(this.character()!);
            form.markAsPristine();
        }

        return form;
    }
}
