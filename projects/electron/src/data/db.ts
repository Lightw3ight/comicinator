import { app } from 'electron';
import path from 'path';
import { Sequelize } from 'sequelize';

const dataPath = app.isPackaged
    ? path.join(app.getAppPath(), 'data')
    : path.join(app.getAppPath(), 'debug-data');

const filePath = path.join(dataPath, 'cdb.db');

console.log('DATA PATH', filePath);

export const db = new Sequelize({
    dialect: 'sqlite',
    storage: filePath,
    define: {
        freezeTableName: true,
        timestamps: false,
    },
});
