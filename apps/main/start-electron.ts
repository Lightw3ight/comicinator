import { spawn } from 'child_process';
import path from 'path';
import waitOn from 'wait-on';

const uiUrl = 'http://localhost:4200'; // Replace with your actual dev server URL

waitOn({ resources: [uiUrl], timeout: 30000 })
    .then(() => {
        const forgePath = path.resolve(
            'node_modules',
            '.bin',
            'electron-forge'
        );
        const child = spawn(forgePath, ['start'], {
            stdio: 'inherit',
            shell: true,
        });

        child.on('exit', (code) => {
            process.exit(code ?? 0);
        });
    })
    .catch((err) => {
        console.error(`❌ Failed to detect UI at ${uiUrl}`, err);
        process.exit(1);
    });
