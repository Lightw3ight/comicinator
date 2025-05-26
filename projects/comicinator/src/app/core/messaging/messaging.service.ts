import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogOptions } from './message-dialog-options.interface';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagingService {
    private dialog = inject(MatDialog);

    public async message(options: MessageDialogOptions) {
        const ref = this.dialog.open<
            MessageDialogComponent,
            MessageDialogOptions,
            boolean
        >(MessageDialogComponent, { disableClose: true, data: options });
        return (await firstValueFrom(ref.afterClosed())) ?? false;
    }

    public async warning(message: string) {
        return await this.message({
            title: 'Warning',
            message,
            hideRejectButton: true,
            confirmButtonText: 'OK',
        });
    }

    public async error(message: string) {
        return await this.message({
            title: 'Error',
            message,
            hideRejectButton: true,
            confirmButtonText: 'OK',
        });
    }

    public async confirm(title: string, message: string) {
        return await this.message({
            title: title,
            message,
            confirmButtonText: 'Yes',
            rejectButtonText: 'No',
        });
    }

    public async retry(message: string) {
        return await this.message({
            title: 'Retry',
            message,
            confirmButtonText: 'Retry',
            rejectButtonText: 'Cancel',
        });
    }

    public async runWithRetry<T>(
        action: () => T | Promise<T>,
        messageFactory: (err: any) => string
    ): Promise<T | undefined> {
        try {
            const result = action();

            if (result instanceof Promise) {
                return await result;
            } else {
                return result;
            }
        } catch (err: any) {
            const message = messageFactory(err);
            const retry = await this.retry(message);

            if (retry) {
                return await this.runWithRetry(action, messageFactory);
            } else {
                return undefined;
            }
        }
    }
}
