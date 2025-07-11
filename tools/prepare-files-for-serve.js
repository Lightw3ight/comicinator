const fs = require('fs');

if (fs.existsSync('dist/app')) {
    fs.rmSync('dist/app', { recursive: true, force: true });
}

fs.renameSync('dist/main', 'dist/app');
