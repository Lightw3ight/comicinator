import { Sequelize } from 'sequelize';
import { DATA_PATH, USER_DATA_PATH } from '../app-paths';

export const userDb = new Sequelize({
    dialect: 'sqlite',
    storage: USER_DATA_PATH,
    define: {
        freezeTableName: true,
        timestamps: false,
    },
});
