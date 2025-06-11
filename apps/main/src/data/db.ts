import { Sequelize } from 'sequelize';
import { DATA_PATH } from '../app-paths';

export const db = new Sequelize({
    dialect: 'sqlite',
    storage: DATA_PATH,
    define: {
        freezeTableName: true,
        timestamps: false,
    },
});
