import { db } from '../db';
import { Setting } from './setting';

export class SettingController {
    public static async selectAll() {
        const results = await Setting.findAll();

        return results.map((r) => r.get({ plain: true }));
    }

    public static async saveAll(settings: Setting[]) {
        const tx = await db.transaction();

        try {
            await Setting.destroy({
                transaction: tx,
                where: {},
                truncate: true,
            });

            for (let setting of settings) {
                await Setting.create(setting, { transaction: tx });
            }

            await tx.commit();
        } catch (error) {
            await tx.rollback();
            throw error;
        }
    }
}
