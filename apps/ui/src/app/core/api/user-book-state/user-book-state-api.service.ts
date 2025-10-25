import { inject, Injectable } from '@angular/core';
import { ElectronService } from '../../electron.service';
import { UserBookState } from '../../models/user-book-state.interface';

@Injectable({ providedIn: 'root' })
export class UserBookStateApiService {
    private electron = inject(ElectronService);

    public async selectAll(): Promise<UserBookState[]> {
        return await this.electron.run<UserBookState[]>('userBookSelectAll');
    }

    public async selectById(
        bookId: number,
    ): Promise<UserBookState | undefined> {
        return await this.electron.run<UserBookState | undefined>(
            'userBookSelectById',
            bookId,
        );
    }

    public async setBookState(
        bookId: number,
        state: Partial<Omit<UserBookState, 'bookId'>>,
    ): Promise<void> {
        return await this.electron.run<void>(
            'userBookSetBookState',
            bookId,
            state,
        );
    }
}
