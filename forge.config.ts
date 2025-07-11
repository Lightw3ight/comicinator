import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';

const config: ForgeConfig = {
    packagerConfig: {
        asar: {
            unpack: '**/node_modules/{sharp,@img}/**/*',
        },
        extraResource: ['./resources/no-image.jpg', './resources/app.ico'],
        icon: './resources/app.ico',
        ignore: [
            /\.nx/,
            /\.angular/,
            /debug-data/,
            /tmp/,
            /\.github/,
            /apps/,
            /\.vscode/,
        ],
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({ setupIcon: './resources/app.ico' }),
        new MakerZIP({}, ['darwin']),
        new MakerRpm({}),
        new MakerDeb({}),
    ],
    plugins: [new AutoUnpackNativesPlugin({})],
    publishers: [],
};

export default config;
