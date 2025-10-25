import { InferAttributes } from 'sequelize';
import { BookController } from '../book/book-controller';
import { UserBookState } from '../user-book-state/user-book-state';
import { UserBookStateController } from '../user-book-state/user-book-state.controller';
import { FollowSeries } from './follow-series';

export class FollowSeriesController {
    public static async selectAll() {
        const results = await FollowSeries.findAll();

        return results.map((r) => r.seriesName);
    }

    public static async followSeries(seriesName: string) {
        const existing = await FollowSeries.findByPk(seriesName);

        if (!existing) {
            await FollowSeries.create({
                seriesName,
            });
        }
    }

    public static async unfollowSeries(seriesName: string) {
        const existing = await FollowSeries.findByPk(seriesName);
        if (existing) {
            await existing.destroy();
        }
    }

    public static async selectSeriesWithUnreadBooks() {
        const followed = await this.selectAll();
        const state = await UserBookStateController.selectAll();

        const stateMap = state.reduce<
            Record<number, InferAttributes<UserBookState>>
        >((acc, curr) => {
            acc[curr.bookId] = curr;
            return acc;
        }, {});

        const seriesWithUnread: string[] = [];

        for (const seriesName of followed) {
            const books = await BookController.selectByGroup(
                'series',
                seriesName,
            );
            const unreadBooks = books.filter((b) => {
                const bookState = stateMap[b.id];
                return !bookState || !bookState.complete;
            });

            if (unreadBooks.length > 0) {
                seriesWithUnread.push(seriesName);
            }
        }

        return seriesWithUnread;
    }
}
