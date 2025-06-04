import { inject, Injectable } from '@angular/core';
import { CharactersApiService } from '../api/characters/characters-api.service';
import { ComicVineService } from '../api/comic-vine/comic-vine-api.service';
import { BookResult } from '../api/comic-vine/models/book-result.interface';
import { CharacterResult } from '../api/comic-vine/models/character-result.interface';
import { ItemBase } from '../api/comic-vine/models/item-base.interface';
import { LocationResult } from '../api/comic-vine/models/location-result.interface';
import { TeamResult } from '../api/comic-vine/models/team-result.interface';
import { VolumeResult } from '../api/comic-vine/models/volume-result.interface';
import { LocationsApiService } from '../api/locations/locations-api.service';
import { PublishersApiService } from '../api/publishers/publishers-api.service';
import { TeamsApiService } from '../api/teams/teams-api.service';
import { MessagingService } from '../messaging/messaging.service';
import { Character } from '../models/character.interface';
import { Location } from '../models/location.interface';
import { Team } from '../models/team.interface';
import { CharactersStore } from '../store/characters/characters.store';
import { LocationsStore } from '../store/locations/locations.store';
import { PublishersStore } from '../store/publishers/publishers.store';
import { TeamsStore } from '../store/teams/teams.store';
import { AbortedImport } from './aborted-import';
import { BookImportResult } from './book-import-result.interface';
import { CharacterImportResult } from './character-import-result.interface';
import { LocationImportResult } from './location-import-result.interface';
import { TeamImportResult } from './team-import-result.interface';

type ProgressReporter = (progress: string) => void;

@Injectable({ providedIn: 'root' })
export class ImporterService {
    private teamsApiService = inject(TeamsApiService);
    private charactersApiService = inject(CharactersApiService);
    private locationsApiService = inject(LocationsApiService);
    private publishersApiService = inject(PublishersApiService);

    private charactersStore = inject(CharactersStore);
    private comicVineService = inject(ComicVineService);
    private publishersStore = inject(PublishersStore);
    private teamsStore = inject(TeamsStore);
    private locationsStore = inject(LocationsStore);
    private messaging = inject(MessagingService);

    public async importBook(
        result: BookResult,
        volume: VolumeResult,
        progress?: ProgressReporter,
    ): Promise<BookImportResult> {
        const publisherId = await this.importPublisher(
            volume.publisher,
            progress,
        );

        const characterIds = await this.importCharacters(
            result.characterCredits,
            publisherId,
            undefined,
            true,
            progress,
        );
        const teamIds = await this.importTeams(
            result.teamCredits,
            publisherId,
            true,
            progress,
        );
        const locationIds = await this.importLocations(
            result.locations,
            progress,
        );

        let title = result.name;

        if (title == null && volume.name != null) {
            title = `${volume.name} ${result.issueNumber?.toString().padStart(3, '0')} (${volume.startYear})`;
        }
        return {
            book: {
                title,
                colorist: this.getPersonName(result, ['colorist']),
                coverArtist: this.getPersonName(result, ['cover']),
                editor: this.getPersonName(result, ['editor']),
                letterer: this.getPersonName(result, ['letterer']),
                writer: this.getPersonName(result, ['writer']),
                penciler: this.getPersonName(result, ['artist', 'penciler']),
                externalUrl: result.siteUrl,
                inker: this.getPersonName(result, ['inker', 'artist']),
                number: Number(result.issueNumber),
                series: volume?.name,
                volume: volume.startYear ? Number(volume.startYear) : undefined,
                coverDate: result.coverDate,
                externalId: result.id,
                publisherId,
            },
            characterIds,
            teamIds,
            locationIds,
        };
    }

    public async importCharacter(
        result: CharacterResult,
        progress?: ProgressReporter,
    ): Promise<CharacterImportResult> {
        progress?.(`Fetching character image`);
        const response = await fetch(result.image.original_url);
        const image = await response.blob();
        const publisherId = await this.importPublisher(
            result.publisher,
            progress,
        );
        const teamIds = await this.importTeams(
            result.teams,
            publisherId,
            false,
            progress,
        );

        const character: Partial<Character> = {
            name: result.name,
            aliases: result.aliases ?? '',
            description: result.summary ?? '',
            publisherId: publisherId,
            realName: result.realName ?? '',
            creators: result.creators ?? '',
            origin: result.origin ?? '',
            powers: result.powers ?? '',
            externalUrl: result.siteUrl ?? '',
            externalId: result.id,
            birthDate: result.birth ?? undefined,
            gender: result.gender,
        };

        return { character, image, teamIds };
    }

    public async importTeam(
        result: TeamResult,
        importMembers: boolean,
        currentTeamId: number | undefined,
        progress?: ProgressReporter,
    ): Promise<TeamImportResult> {
        progress?.(`Fetching team image`);
        const imageResponse = await fetch(result.image.originalUrl);
        const image = await imageResponse.blob();
        const publisherId = await this.importPublisher(
            result.publisher,
            progress,
        );

        const characterIds = await this.importCharacters(
            result.characters,
            publisherId,
            currentTeamId,
            importMembers,
            progress,
        );

        const team: Partial<Team> = {
            name: result.name,
            description: result.summary ?? '',
            publisherId: publisherId,
            externalUrl: result.siteUrl ?? '',
            externalId: result.id,
            aliases: result.aliases,
        };

        return {
            team,
            characterIds,
            image,
        };
    }

    public async importLocation(
        result: LocationResult,
        progress?: ProgressReporter,
    ): Promise<LocationImportResult> {
        progress?.(`Fetching location image`);
        const imageResponse = await fetch(result.image.originalUrl);
        const image = await imageResponse.blob();

        const location: Partial<Location> = {
            name: result.name,
            description: result.description ?? '',
            externalUrl: result.siteUrl ?? '',
            externalId: result.id,
        };

        return {
            location,
            image,
        };
    }

    private getPersonName(result: BookResult, roles: string[]) {
        return (result.personCredits ?? [])
            .filter((o) => roles.some((role) => o.role.includes(role)))
            .map((o) => o.name)
            .join(', ');
    }

    private async importCharacters(
        characters: ItemBase[] | undefined,
        publisherId: number | undefined,
        currentTeamId: number | undefined,
        addNewMembers: boolean,
        progress: ProgressReporter | undefined,
    ) {
        const ids: number[] = [];

        for (let item of characters ?? []) {
            progress?.(`Checking for existing character: ${item.name}`);
            const existing = await this.charactersApiService.findForImport(
                item.id,
                item.name,
                publisherId,
            );

            if (existing) {
                ids.push(existing.id);
            } else if (addNewMembers) {
                progress?.(`Importing character: ${item.name}`);

                const errorMessage = () =>
                    `An error occurred while retrieving character information for ${item.name}`;
                const char = await this.messaging.runWithRetry(
                    () => this.comicVineService.getCharacter(item.id),
                    errorMessage,
                );

                if (char == null) {
                    throw new AbortedImport('Aborted at character import');
                }

                const publisherId = await this.importPublisher(
                    char?.publisher,
                    progress,
                );
                const newId = await this.charactersStore.importCharacter(
                    char,
                    publisherId,
                    currentTeamId,
                );
                ids.push(newId);
            }
        }

        return ids;
    }

    private async importPublisher(
        publisher: ItemBase | undefined,
        progress: ProgressReporter | undefined,
    ) {
        if (!publisher) {
            return undefined;
        }

        let publisherId = (
            await this.publishersApiService.findForImport(
                publisher.id,
                publisher.name,
            )
        )?.id;

        if (publisherId == null) {
            progress?.(`Importing publisher: ${publisher.name}`);
            // TODO: Add publisher import
            publisherId = await this.publishersStore.addPublisher({
                name: publisher.name,
                externalId: publisher.id,
                externalUrl: publisher.siteUrl,
            });
        }

        return publisherId;
    }

    private async importTeams(
        teams: ItemBase[] | undefined,
        publisherId: number | undefined,
        addNewTeams: boolean,
        progress: ProgressReporter | undefined,
    ) {
        const ids: number[] = [];

        for (let item of teams ?? []) {
            progress?.(`Checking for existing team: ${item.name}`);
            const existing = await this.teamsApiService.findForImport(
                item.id,
                item.name,
                publisherId,
            );

            if (existing) {
                ids.push(existing.id);
            } else if (addNewTeams) {
                progress?.(`Importing team: ${item.name}`);

                const errorMessage = () =>
                    `An error occurred while retrieving team information for ${item.name}`;
                const team = await this.messaging.runWithRetry(
                    () => this.comicVineService.getTeam(item.id),
                    errorMessage,
                );

                if (team == null) {
                    throw new AbortedImport('Aborted at team import');
                }

                const publisherId = await this.importPublisher(
                    team?.publisher,
                    progress,
                );
                const newId = await this.teamsStore.importTeam(
                    team,
                    publisherId,
                );
                ids.push(newId);
            }
        }

        return ids;
    }

    private async importLocations(
        locations: ItemBase[] | undefined,
        progress: ProgressReporter | undefined,
    ) {
        const ids: number[] = [];

        for (let item of locations ?? []) {
            progress?.(`Checking for existing location: ${item.name}`);
            const existing = await this.locationsApiService.findForImport(
                item.id,
                item.name,
            );

            if (existing) {
                ids.push(existing.id);
            } else {
                progress?.(`Importing location: ${item.name}`);

                const errorMessage = () =>
                    `An error occurred while retrieving team information for ${item.name}`;
                const location = await this.messaging.runWithRetry(
                    () => this.comicVineService.getLocation(item.id),
                    errorMessage,
                );

                if (location == null) {
                    throw new AbortedImport('Aborted at location import');
                }

                const newId =
                    await this.locationsStore.importLocation(location);
                ids.push(newId);
            }
        }

        return ids;
    }
}
