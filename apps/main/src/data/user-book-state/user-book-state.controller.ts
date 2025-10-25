import { InferAttributes } from 'sequelize';
import { UserBookState } from './user-book-state';

export class UserBookStateController {
    public static async selectById(id: number) {
        const model = await UserBookState.findByPk(id);
        return model?.get({ plain: true });
    }

    public static async selectAll() {
        const results = await UserBookState.findAll();

        return results.map((r) => r.get({ plain: true }));
    }

    public static async setBookState(
        bookId: number,
        state: Partial<Omit<InferAttributes<UserBookState>, 'bookId'>>,
    ) {
        const existing = await this.selectById(bookId);

        if (existing) {
            await UserBookState.update(
                { ...existing, ...state },
                { where: { bookId: bookId } },
            );
        } else {
            await UserBookState.create({
                bookId,
                complete: state.complete ?? false,
                currentPage: state.currentPage ?? 1,
                lastOpened: state.lastOpened ?? new Date(),
            });
        }
    }

    public static async deleteBookState(bookId: number) {
        await UserBookState.destroy({ where: { bookId } });
    }
}
